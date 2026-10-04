import { ConnectorError, type ConnectorFailure } from '@deskorama/core';
import { FIXTURE_TIME, type RecordedResponse } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createGithub } from '../src/create-github.ts';
import { answerFrom } from './answer-from.ts';
import { MINUTE, pollOnce } from './poll-once.ts';
import { recording } from './recording.ts';
import { firstPollOfApp, TRAMLO_APP, TRAMLO_APP_REPOSITORY, unchangedPollOfApp } from './tramlo-app.ts';

/**
 * Returns the failure of a first poll of Tramlo's repository whose answers are the first poll's with `changes`.
 * @example
 * await failureWith({ '': { status: 404 } }); // { kind: 'permission', permission: 'Metadata: read' }
 */
async function failureWith(
  changes: Readonly<Record<string, RecordedResponse>>,
  settings = TRAMLO_APP,
): Promise<ConnectorFailure> {
  const respond = answerFrom(TRAMLO_APP_REPOSITORY, { ...firstPollOfApp(), ...changes });

  const error: unknown = await pollOnce(createGithub(), settings, respond).then(
    () => null,
    (reason: unknown) => reason,
  );

  if (!(error instanceof ConnectorError)) throw new Error('The poll did not fail with a ConnectorError');

  return error.failure;
}

describe('the GitHub Connector’s limits and failures', () => {
  test('waits as long as X-Poll-Interval asks', async () => {
    const routes = { ...firstPollOfApp(), '': recording('tramlo-app', 'repository.json', { 'X-Poll-Interval': '90' }) };

    const { result } = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, routes));

    expect(result.delay).toBe(90_000);
  });

  test('waits for the rate limit to reset when few requests are left', async () => {
    const reset = FIXTURE_TIME / 1000 + 600;

    const nearlySpent = recording('tramlo-app', 'releases.json', {
      'X-RateLimit-Remaining': '12',
      'X-RateLimit-Reset': String(reset),
    });

    const routes = { ...firstPollOfApp(), '/releases?per_page=10': nearlySpent };

    const { result } = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, routes));

    expect(result.delay).toBe(600_000);
  });

  test('takes a 403 with Retry-After, or one about a secondary rate limit, for a rate limit', async () => {
    expect(await failureWith({ '/releases?per_page=10': { status: 403, headers: { 'Retry-After': '30' } } })).toEqual({
      kind: 'rate-limit',
      resetAt: FIXTURE_TIME + 30_000,
    });

    const secondary = { status: 403, body: { message: 'You have exceeded a secondary rate limit.' } };

    expect(await failureWith({ '/releases?per_page=10': secondary })).toEqual({
      kind: 'rate-limit',
      resetAt: FIXTURE_TIME + 60_000,
    });
  });

  test('names the permission each list needs', async () => {
    const refused = { status: 403, body: { message: 'Resource not accessible by personal access token' } };

    expect(await failureWith({ '/actions/runs?per_page=30&exclude_pull_requests=true': refused })).toEqual({
      kind: 'permission',
      permission: 'Actions: read',
    });

    expect(await failureWith({ '/deployments?per_page=10': refused })).toEqual({
      kind: 'permission',
      permission: 'Deployments: read',
    });
  });

  test('takes a repository it cannot see for a missing access to it', async () => {
    expect(await failureWith({ '': { status: 404, body: { message: 'Not Found' } } })).toEqual({
      kind: 'permission',
      permission: 'Metadata: read',
    });
  });

  test('refuses a repository that is not written owner/name', async () => {
    const settings = { ...TRAMLO_APP, values: { repository: 'tramlo-app' } };

    expect(await failureWith({}, settings)).toEqual({ kind: 'invalid-response' });
  });

  test('forgets a run deleted while it was still going', async () => {
    const first = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(TRAMLO_APP_REPOSITORY, firstPollOfApp()));

    const routes = { ...unchangedPollOfApp(), '/actions/runs/5103': { status: 404 } };

    const second = await pollOnce(
      createGithub(),
      TRAMLO_APP,
      answerFrom(TRAMLO_APP_REPOSITORY, routes),
      first.result.cursor,
      MINUTE,
    );

    const third = await pollOnce(
      createGithub(),
      TRAMLO_APP,
      answerFrom(TRAMLO_APP_REPOSITORY, unchangedPollOfApp()),
      second.result.cursor,
      2 * MINUTE,
    );

    expect(third.sent.some((request) => request.url.endsWith('/actions/runs/5103'))).toBe(false);
  });
});
