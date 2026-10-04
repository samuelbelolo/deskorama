import { ConnectorError } from './connector-error.ts';
import type { ConnectorResponse } from './connector-fetch.ts';
import { rateLimitReset } from './rate-limit-reset.ts';

/**
 * Returns the {@link ConnectorError} an HTTP status means, or null for a success or a `304 Not Modified`. 401 is a
 * refused token; 403 is a missing permission, named after `permission`, unless the rate-limit headers say the
 * quota is spent; 429 is a rate limit with its reset; 408 and 5xx are network failures; any other status is an
 * unexpected response.
 * @example
 * responseFailure({ status: 401, … }, now, 'read:events'); // ConnectorError { failure: { kind: 'auth' } }
 * responseFailure({ status: 200, … }, now, 'read:events'); // null
 */
export function responseFailure(response: ConnectorResponse, now: number, permission: string): ConnectorError | null {
  const { status, headers } = response;

  if ((status >= 200 && status < 300) || status === 304) return null;

  const said = `The service answered ${status}`;

  if (status === 401) return new ConnectorError({ kind: 'auth' }, `${said}: the token is refused.`);

  const spent = headers.get('x-ratelimit-remaining') === '0';

  if (status === 429 || (status === 403 && spent)) {
    return new ConnectorError({ kind: 'rate-limit', resetAt: rateLimitReset(headers, now) }, `${said}.`);
  }

  if (status === 403) return new ConnectorError({ kind: 'permission', permission }, `${said}.`);

  if (status === 408 || status >= 500) return new ConnectorError({ kind: 'network' }, `${said}.`);

  return new ConnectorError({ kind: 'invalid-response' }, `${said}.`);
}
