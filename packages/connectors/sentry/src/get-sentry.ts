import { parsePayload, readJson, sendRequest, type PollInput, type StandardSchema } from '@deskorama/core';
import { nextPage } from './next-page.ts';
import { sentryFailure } from './sentry-failure.ts';

/** How an answer of Sentry is read: what validates it, what it is called in a failure, and the scope it needed. */
interface SentryRead<Output> {
  readonly schema: StandardSchema<Output>;
  readonly what: string;
  /** The scope a refusal names, as Sentry names it. */
  readonly permission: string;
}

/** One answer of Sentry: what it holds, and Sentry's cursor for the page after it, or null when it is the last. */
interface SentryAnswer<Output> {
  readonly payload: Output;
  readonly next: string | null;
}

/**
 * Sends a `GET` to Sentry with the token, the injected `fetch` and the time a poll or a listing receives, and
 * returns the answer validated by `read.schema`, with the cursor of the next page its `Link` header gives. Throws
 * the {@link ConnectorError} a failed answer means, a refusal naming `read.permission`.
 * @example
 * await getSentry(input, 'https://sentry.io/api/0/organizations/?per_page=100',
 *   { schema: ORGANIZATION_OPTIONS_SCHEMA, what: 'The organizations', permission: 'org:read' });
 * // { payload: [{ value: 'tramlo', label: 'Tramlo' }], next: null }
 */
export async function getSentry<Output>(
  call: Pick<PollInput, 'settings' | 'fetch' | 'now'>,
  url: string,
  read: SentryRead<Output>,
): Promise<SentryAnswer<Output>> {
  const headers = { Accept: 'application/json', Authorization: `Bearer ${call.settings.token}` };

  const response = await sendRequest(call.fetch, url, { method: 'GET', headers });

  const failure = sentryFailure(response, call.now, read.permission);

  if (failure !== null) throw failure;

  const payload = await parsePayload(read.schema, await readJson(response, read.what), read.what);

  const next = nextPage(response.headers.get('link'));

  return { payload, next };
}
