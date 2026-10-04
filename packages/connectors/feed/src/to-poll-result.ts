import type { PollResult, SourceEvent } from '@deskorama/core';
import type { FeedPage } from './feed-page.ts';
import type { FeedState } from './feed-state.ts';
import { reportedGauges } from './reported-gauges.ts';

/**
 * Returns what a Feed page means for the platform: its Events and Gauges, the cursor to persist, and the delay
 * before the next poll (none when more Events wait, the backend's hint otherwise). The ETag is kept only when the
 * cursor stays the same, since it describes the answer to that cursor.
 * @example
 * const page = { events: [], next_cursor: 'c_7', has_more: false, poll_interval: 120 };
 * toPollResult(page, [], { cursor: 'c_7', etag: null }, '"p7"');
 * // { events: [], cursor: '{"cursor":"c_7","etag":"\\"p7\\""}', delay: 120000 }
 */
export function toPollResult(
  page: FeedPage,
  events: readonly SourceEvent[],
  previous: FeedState,
  etag: string | null,
): PollResult {
  const cursor = page.next_cursor ?? previous.cursor;

  const next: FeedState = { cursor, etag: cursor === previous.cursor ? etag : null };

  const delay = nextDelay(page);

  const gauges = page.gauges === undefined ? undefined : reportedGauges(page.gauges);

  return {
    events,
    cursor: JSON.stringify(next),
    ...(delay === undefined ? {} : { delay }),
    ...(gauges === undefined ? {} : { gauges }),
  };
}

/**
 * Returns the wait a page asks for, in milliseconds: none while more Events wait, the backend's hint in seconds
 * otherwise, and nothing for a hint of zero, which would poll in a loop; the platform keeps it within the bounds.
 * @example
 * nextDelay({ events: [], next_cursor: 'c_7', has_more: true }); // 0
 * nextDelay({ events: [], next_cursor: 'c_7', has_more: false, poll_interval: 120 }); // 120000
 */
function nextDelay(page: FeedPage): number | undefined {
  if (page.has_more) return 0;

  if (page.poll_interval === undefined || page.poll_interval === 0) return undefined;

  return page.poll_interval * 1000;
}
