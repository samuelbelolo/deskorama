import { describe, expect, test } from 'vitest';
import { ConnectorError } from '../src/connector-error.ts';
import { parsePayload } from '../src/parse-payload.ts';
import { readJson } from '../src/read-json.ts';
import { responseFailure } from '../src/response-failure.ts';
import { sendRequest } from '../src/send-request.ts';
import type { StandardSchema } from '../src/standard-schema.ts';
import { httpResponse } from './http-response.ts';

const NOW = Date.UTC(2026, 9, 4, 14);

/** A schema that accepts a number only, written by hand against the Standard Schema interface. */
const NUMBER: StandardSchema<number> = {
  '~standard': {
    version: 1,
    vendor: 'test',
    validate: (value) =>
      typeof value === 'number' ? { value } : { issues: [{ message: 'Expected a number', path: ['count'] }] },
  },
};

/**
 * A `fetch` that never gets an answer, as without a network.
 * @example
 * await offline(); // throws TypeError('fetch failed')
 */
async function offline(): Promise<never> {
  throw new TypeError('fetch failed');
}

/**
 * Returns the failure a rejected promise carries, or fails the test when it resolves or throws something else.
 * @example
 * await failureOf(readJson(httpResponse(200, {}, 'nope'), 'The page')); // { kind: 'invalid-response' }
 */
async function failureOf(promise: Promise<unknown>): Promise<ConnectorError['failure']> {
  const error: unknown = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  );

  if (!(error instanceof ConnectorError)) throw new Error(`Expected a ConnectorError, got ${String(error)}`);

  return error.failure;
}

describe('the failure an HTTP status means', () => {
  test('a success and a 304 are no failure', () => {
    expect(responseFailure(httpResponse(200), NOW, 'read')).toBeNull();
    expect(responseFailure(httpResponse(304), NOW, 'read')).toBeNull();
  });

  test('401 is a refused token, 403 names the missing permission', () => {
    expect(responseFailure(httpResponse(401), NOW, 'read')?.failure).toEqual({ kind: 'auth' });
    expect(responseFailure(httpResponse(403), NOW, 'Actions: read')?.failure).toEqual({
      kind: 'permission',
      permission: 'Actions: read',
    });
  });

  test('429 and a 403 with a spent quota wait for the reset the service announced', () => {
    expect(responseFailure(httpResponse(429, { 'Retry-After': '30' }), NOW, 'read')?.failure).toEqual({
      kind: 'rate-limit',
      resetAt: NOW + 30_000,
    });

    const spent = httpResponse(403, { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '1791124200' });

    expect(responseFailure(spent, NOW, 'read')?.failure).toEqual({ kind: 'rate-limit', resetAt: 1_791_124_200_000 });
  });

  test('a rate limit without a reset waits one minute', () => {
    expect(responseFailure(httpResponse(429), NOW, 'read')?.failure).toEqual({
      kind: 'rate-limit',
      resetAt: NOW + 60_000,
    });
  });

  test('5xx and 408 are network failures, any other status an unexpected response', () => {
    expect(responseFailure(httpResponse(503), NOW, 'read')?.failure).toEqual({ kind: 'network' });
    expect(responseFailure(httpResponse(408), NOW, 'read')?.failure).toEqual({ kind: 'network' });
    expect(responseFailure(httpResponse(404), NOW, 'read')?.failure).toEqual({ kind: 'invalid-response' });
  });
});

describe('a request and its body', () => {
  test('a request that gets no answer is a network failure', async () => {
    expect(await failureOf(sendRequest(offline, 'https://feed.tramlo.example/events', { headers: {} }))).toEqual({
      kind: 'network',
    });
  });

  test('a body that is not JSON is an unexpected response', async () => {
    expect(await readJson(httpResponse(200, {}, '{"ok":true}'), 'The page')).toEqual({ ok: true });
    expect(await failureOf(readJson(httpResponse(200, {}, '<html>'), 'The page'))).toEqual({
      kind: 'invalid-response',
    });
  });

  test('a payload that fails its schema is an unexpected response naming the problem', async () => {
    expect(await parsePayload(NUMBER, 4, 'The count')).toBe(4);

    const error: unknown = await parsePayload(NUMBER, 'four', 'The count').catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ConnectorError);
    expect(error).toMatchObject({
      failure: { kind: 'invalid-response' },
      message: 'The count is not valid: count: Expected a number',
    });
  });
});
