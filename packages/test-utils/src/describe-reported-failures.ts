import { ConnectorError, type ConnectorFailure } from '@deskorama/core';
import { expect, test } from 'vitest';
import type { Responder } from './create-fake-fetch.ts';

/** What the shared suite needs to play one call of a Connector against a service that fails. */
export interface ReportedFailuresCase {
  /** What is called, as the names of the tests say it, e.g. "a poll". */
  readonly what: string;
  /** Makes the call with a `fetch` that `respond` answers. */
  readonly call: (respond: Responder) => Promise<unknown>;
  /** The names of the permissions the Connector asks for. */
  readonly permissions: readonly string[];
  /** The time of the call. */
  readonly now: number;
}

/**
 * Registers the tests of what a call of a Connector reports when the service fails: a refused token, a missing
 * permission named among those the Connector asks for, a rate limit with its reset, a server error or no answer at
 * all, and an answer it cannot read each become the {@link ConnectorError} the platform acts on, never anything else.
 * @example
 * describeReportedFailures({ what: 'a poll', call: poll, permissions: ['event:read'], now: FIXTURE_TIME });
 */
export function describeReportedFailures(failures: ReportedFailuresCase): void {
  const { what, permissions, now } = failures;

  test(`${what} reports a refused token, naming nothing else`, async () => {
    const failure = await failureOf(failures, () => ({ status: 401, body: { message: 'Bad credentials' } }));

    expect(failure).toEqual({ kind: 'auth' });
  });

  test(`${what} names the missing permission, among those the Connector asks for`, async () => {
    const failure = await failureOf(failures, () => ({ status: 403, body: { message: 'Forbidden' } }));

    expect(failure?.kind).toBe('permission');
    expect(permissions).toContain(failure?.kind === 'permission' ? failure.permission : undefined);
  });

  test(`${what} reports the reset a rate limit announces`, async () => {
    const failure = await failureOf(failures, () => ({ status: 429, headers: { 'Retry-After': '120' } }));

    expect(failure).toEqual({ kind: 'rate-limit', resetAt: now + 120_000 });
  });

  test(`${what} reports a server error or no answer at all as a network failure`, async () => {
    expect(await failureOf(failures, () => ({ status: 503, body: 'Service Unavailable' }))).toEqual({
      kind: 'network',
    });

    expect(
      await failureOf(failures, () => {
        throw new TypeError('fetch failed');
      }),
    ).toEqual({ kind: 'network' });
  });

  test(`${what} reports an answer it cannot read as an unexpected response`, async () => {
    const failure = await failureOf(failures, () => ({ status: 200, body: '<html>Login</html>' }));

    expect(failure).toEqual({ kind: 'invalid-response' });
  });
}

/**
 * Returns the failure a call answered by `respond` reports, null when it succeeds, and fails the test when the
 * Connector throws anything but a ConnectorError.
 * @example
 * await failureOf({ what: 'a poll', call: poll, permissions, now }, () => ({ status: 401 })); // { kind: 'auth' }
 */
async function failureOf(failures: ReportedFailuresCase, respond: Responder): Promise<ConnectorFailure | null> {
  const error: unknown = await failures.call(respond).then(
    () => null,
    (reason: unknown) => reason,
  );

  if (error === null) return null;

  if (!(error instanceof ConnectorError))
    throw new Error(`${failures.what} threw something else than a ConnectorError`, { cause: error });

  return error.failure;
}
