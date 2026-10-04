import type { ConnectorResponse } from './connector-fetch.ts';

/** How long to wait when a service limits the rate without saying until when. */
const DEFAULT_WAIT_MS = 60_000;

/**
 * Returns when a rate limit resets, in milliseconds since the epoch, from the headers services use: `Retry-After`
 * (seconds or an HTTP date), then `X-RateLimit-Reset` or `RateLimit-Reset` (epoch seconds, or seconds from now when
 * the value is small). Without any of them, one minute from `now`.
 * @example
 * rateLimitReset(headersOf({ 'retry-after': '30' }), 1_000_000); // 1_030_000
 * rateLimitReset(headersOf({ 'x-ratelimit-reset': '1791122400' }), 0); // 1_791_122_400_000
 */
export function rateLimitReset(headers: ConnectorResponse['headers'], now: number): number {
  const retryAfter = headers.get('retry-after');

  if (retryAfter !== null) {
    const seconds = Number(retryAfter);

    if (Number.isFinite(seconds)) return now + seconds * 1000;

    const date = Date.parse(retryAfter);

    if (Number.isFinite(date)) return date;
  }

  const reset = Number(headers.get('x-ratelimit-reset') ?? headers.get('ratelimit-reset') ?? Number.NaN);

  if (!Number.isFinite(reset)) return now + DEFAULT_WAIT_MS;

  // Epoch seconds are above a billion; a smaller value counts seconds from now (IETF RateLimit headers).
  return reset > 1_000_000_000 ? reset * 1000 : now + reset * 1000;
}
