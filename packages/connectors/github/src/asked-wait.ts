import { rateLimitReset, type ConnectorResponse } from '@deskorama/core';

/** Below this many requests left in the hour, the next poll waits for the rate limit to reset. */
const LOW_REMAINING = 50;

/**
 * Returns how long GitHub asks a client to wait before reading again, in milliseconds: its `X-Poll-Interval`, or
 * until the rate limit resets when few requests are left, whichever is longer; undefined when it asks nothing. The
 * platform keeps it within the Connector's interval bounds; the reads made before the reset are mostly `304`s,
 * which do not count against the limit.
 * @example
 * askedWait(headersOf({ 'x-poll-interval': '60' }), now); // 60_000
 * askedWait(headersOf({ 'x-ratelimit-remaining': '12', 'x-ratelimit-reset': '1791122400' }), now); // until then
 */
export function askedWait(headers: ConnectorResponse['headers'], now: number): number | undefined {
  const interval = Number(headers.get('x-poll-interval') ?? Number.NaN);

  const remaining = Number(headers.get('x-ratelimit-remaining') ?? Number.NaN);

  const waits = [
    Number.isFinite(interval) && interval > 0 ? interval * 1000 : 0,
    remaining < LOW_REMAINING ? rateLimitReset(headers, now) - now : 0,
  ];

  const longest = Math.max(...waits);

  return longest > 0 ? longest : undefined;
}
