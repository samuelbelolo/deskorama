import { readJson, sendRequest, type ConnectorFetch } from '@deskorama/core';
import { askedWait } from './asked-wait.ts';
import type { GithubAnswer } from './github-answer.ts';
import { githubFailure } from './github-failure.ts';

/** The REST API version every request asks for. */
const API_VERSION = '2026-03-10';

/** How to read one address. */
export interface ReadOptions {
  /**
   * False to ask without the previous ETag and keep none, for an answer whose `304` would hide what is needed,
   * such as a count held in a header. True by default.
   */
  readonly conditional?: boolean;
}

/** The reads of one poll against one repository. */
export interface GithubSession {
  /**
   * Reads one address of the repository, such as `/pulls?state=all`, sending back the ETag of the previous poll's
   * answer to it; throws a `ConnectorError` named after `permission` when GitHub refuses.
   */
  readonly get: (path: string, permission: string, options?: ReadOptions) => Promise<GithubAnswer>;
  /** The ETag of every address read during this poll, to send back on the next one. */
  readonly etags: () => Readonly<Record<string, string>>;
  /** The longest wait GitHub asked for during this poll, in milliseconds. */
  readonly wait: () => number | undefined;
  /** When GitHub answered first during this poll, by its own clock (the `Date` header); undefined without one. */
  readonly serverTime: () => number | undefined;
}

/** What a session needs: the repository's API address, the token, the injected `fetch` and the previous ETags. */
export interface GithubSessionOptions {
  readonly base: string;
  readonly token: string;
  readonly fetch: ConnectorFetch;
  readonly now: number;
  readonly etags: Readonly<Record<string, string>>;
}

/**
 * Returns a session that reads a repository through GitHub's REST API with conditional requests: an address whose
 * answer did not change costs a `304`, free against the rate limit.
 * @example
 * const session = createGithubSession({ base: 'https://api.github.com/repos/tramlo/tramlo-app', token, fetch, now,
 *   etags: {} });
 * await session.get('/releases?per_page=10', CONTENTS_PERMISSION); // { kind: 'changed', body: [ … ], headers }
 */
export function createGithubSession(options: GithubSessionOptions): GithubSession {
  const etags: Record<string, string> = {};

  let wait: number | undefined;
  let serverTime: number | undefined;

  const get = async (path: string, permission: string, read: ReadOptions = {}): Promise<GithubAnswer> => {
    const conditional = read.conditional ?? true;

    const previous = conditional ? options.etags[path] : undefined;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${options.token}`,
      'X-GitHub-Api-Version': API_VERSION,
      ...(previous === undefined ? {} : { 'If-None-Match': previous }),
    };

    const response = await sendRequest(options.fetch, `${options.base}${path}`, { method: 'GET', headers });

    const date = Date.parse(response.headers.get('date') ?? '');

    if (!Number.isNaN(date)) serverTime = Math.min(serverTime ?? date, date);

    const asked = askedWait(response.headers, options.now);

    if (asked !== undefined) wait = Math.max(wait ?? 0, asked);

    if (response.status === 404) return { kind: 'missing' };

    if (response.status === 409) return { kind: 'empty' };

    const failure = await githubFailure(response, options.now, permission);

    if (failure !== null) throw failure;

    const etag = response.headers.get('etag') ?? previous;

    if (conditional && etag !== undefined) etags[path] = etag;

    if (response.status === 304) return { kind: 'unchanged' };

    return { kind: 'changed', body: await readJson(response, 'GitHub’s answer'), headers: response.headers };
  };

  return { get, etags: () => etags, wait: () => wait, serverTime: () => serverTime };
}
