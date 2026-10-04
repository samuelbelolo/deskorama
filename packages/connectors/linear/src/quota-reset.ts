import { rateLimitReset, type ConnectorResponse } from '@deskorama/core';

/** The quotas Linear counts, each with its remaining amount and its reset in milliseconds since the epoch. */
const QUOTAS = ['requests', 'complexity', 'endpoint-requests'];

/**
 * Returns when the quota Linear ran out of resets: the latest reset among the quotas whose remaining amount is spent,
 * or, when the headers do not say which, the latest reset announced; without any, the usual headers.
 * @example
 * quotaReset(headersOf({ 'x-ratelimit-complexity-remaining': '0', 'x-ratelimit-complexity-reset': '1791123300000',
 *   'x-ratelimit-requests-remaining': '2400', 'x-ratelimit-requests-reset': '1791122460000' }), now); // 1791123300000
 */
export function quotaReset(headers: ConnectorResponse['headers'], now: number): number {
  const quotas = QUOTAS.map((quota) => ({
    reset: Number(headers.get(`x-ratelimit-${quota}-reset`) ?? Number.NaN),
    remaining: Number(headers.get(`x-ratelimit-${quota}-remaining`) ?? Number.NaN),
  })).filter((quota) => Number.isFinite(quota.reset) && quota.reset > now);

  const spent = quotas.filter((quota) => quota.remaining <= 0);

  const known = spent.length > 0 ? spent : quotas;

  if (known.length === 0) return rateLimitReset(headers, now);

  return Math.max(...known.map((quota) => quota.reset));
}
