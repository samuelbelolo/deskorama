import { ConnectorError, parsePayload } from '@deskorama/core';
import * as v from 'valibot';
import type { GithubSession } from './create-github-session.ts';
import { PULL_REQUESTS_PERMISSION } from './github-permissions.ts';
import { lastPage } from './last-page.ts';

/** One pull request per page, so the number of pages is the number of open pull requests. */
const PATH = '/pulls?state=open&per_page=1';

/** A page of open pull requests, of which only the length counts. */
const PAGE_SCHEMA = v.array(v.unknown());

/**
 * Returns how many pull requests are open, to tell them apart from issues in the repository's open count. Asked
 * without an ETag: GitHub's ETag covers the page, not the `Link` header that holds the count.
 * @example
 * await readOpenPulls(session); // 3
 */
export async function readOpenPulls(session: GithubSession): Promise<number> {
  const answer = await session.get(PATH, PULL_REQUESTS_PERMISSION, { conditional: false });

  if (answer.kind === 'missing') {
    throw new ConnectorError({ kind: 'permission', permission: PULL_REQUESTS_PERMISSION }, 'GitHub answered 404.');
  }

  if (answer.kind !== 'changed') return 0;

  const page = await parsePayload(PAGE_SCHEMA, answer.body, 'The open pull requests');

  return lastPage(answer.headers.get('link')) ?? page.length;
}
