import {
  ConnectorError,
  parsePayload,
  readJson,
  responseFailure,
  sendRequest,
  type PollInput,
  type PollResult,
} from '@deskorama/core';
import { toSourceEvent } from '@deskorama/event-json';
import { FEED_PERMISSION, FEED_URL_FIELD } from './feed-config.ts';
import { FEED_PAGE_SCHEMA } from './feed-page-schema.ts';
import { feedUrl } from './feed-url.ts';
import { isHttpsAddress } from './is-https-address.ts';
import { readFeedState } from './read-feed-state.ts';
import { toPollResult } from './to-poll-result.ts';

/**
 * Polls a Feed once: `GET` on its address with the cursor and the token, and `If-None-Match` when the last answer
 * to that cursor had an ETag. A `304` returns nothing new, a `410 Gone` starts over from no cursor at once, and a
 * page returns its Events, named after the Source as the person named it, the next cursor and when to poll again.
 * @example
 * await pollFeed({ settings: { name: 'Tramlo', values: { url }, token }, cursor: null, fetch, now });
 * // { events: [ … ], cursor: '{"cursor":"c_1042","etag":null}', delay: 0 } while has_more is true
 */
export async function pollFeed(input: PollInput): Promise<PollResult> {
  const address = input.settings.values[FEED_URL_FIELD] ?? '';

  if (!isHttpsAddress(address)) {
    throw new ConnectorError({ kind: 'invalid-response' }, 'A Feed address starts with https://.');
  }

  const state = readFeedState(input.cursor);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${input.settings.token}`,
    ...(state.etag === null ? {} : { 'If-None-Match': state.etag }),
  };

  const response = await sendRequest(input.fetch, feedUrl(address, state.cursor), { method: 'GET', headers });

  if (response.status === 410) return { events: [], cursor: null, delay: 0 };

  if (response.status === 304) return { events: [], cursor: input.cursor };

  const failure = responseFailure(response, input.now, FEED_PERMISSION);

  if (failure !== null) throw failure;

  const page = await parsePayload(FEED_PAGE_SCHEMA, await readJson(response, 'The Feed page'), 'The Feed page');

  const events = page.events.map((event) =>
    toSourceEvent({ ...event, source: input.settings.name }, input.now, event.id),
  );

  return toPollResult(page, events, state, response.headers.get('etag'));
}
