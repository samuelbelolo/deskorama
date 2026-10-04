import { ConnectorError, responseFailure, type ConnectorResponse } from '@deskorama/core';
import { SENTRY_PERMISSION } from './sentry-config.ts';

/**
 * Returns the {@link ConnectorError} a Sentry answer means, or null for a success. A rate limit without
 * `Retry-After` waits for the reset Sentry announces in its own header, in seconds since the epoch; every other
 * status reads as for any service.
 * @example
 * sentryFailure({ status: 429, headers: headersOf({ 'x-sentry-rate-limit-reset': '1791122460' }), … }, now);
 * // ConnectorError { failure: { kind: 'rate-limit', resetAt: 1791122460000 } }
 */
export function sentryFailure(response: ConnectorResponse, now: number): ConnectorError | null {
  const reset = Number(response.headers.get('x-sentry-rate-limit-reset') ?? Number.NaN);

  const announced = Number.isFinite(reset) && reset * 1000 > now;

  if (response.status === 429 && response.headers.get('retry-after') === null && announced) {
    return new ConnectorError({ kind: 'rate-limit', resetAt: reset * 1000 }, 'Sentry answered 429.');
  }

  return responseFailure(response, now, SENTRY_PERMISSION);
}
