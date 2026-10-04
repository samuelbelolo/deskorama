import { ConnectorError, type ConnectorFailure } from '@deskorama/core';

/**
 * Returns the failure an error from a poll carries. A Connector throws only a `ConnectorError`; anything else is a
 * bug in it, treated as an unexpected response so the Source is retried rather than crashing the app.
 * @example
 * failureOf(new ConnectorError({ kind: 'auth' }, 'answered 401')); // { kind: 'auth' }
 * failureOf(new TypeError('x is undefined')); // { kind: 'invalid-response' }
 */
export function failureOf(error: unknown): ConnectorFailure {
  return error instanceof ConnectorError ? error.failure : { kind: 'invalid-response' };
}
