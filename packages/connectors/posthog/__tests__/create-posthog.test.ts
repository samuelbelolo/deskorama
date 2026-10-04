import type { PollResult, SourceSettings } from '@deskorama/core';
import { createFakeFetch, FIXTURE_TIME, inOrder, type RecordedResponse, type SentRequest } from '@deskorama/test-utils';
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createPostHog } from '../src/create-posthog.ts';
import { KAVELO_POSTHOG, recordedPostHog } from './kavelo-posthog.ts';

/** The body of a query request, as far as the tests read it. */
const QUERY_BODY = v.object({
  query: v.object({ kind: v.string(), query: v.string(), values: v.record(v.string(), v.string()) }),
  refresh: v.string(),
});

/**
 * Polls Kavelo's PostHog project once with `settings`, through a fake `fetch` answering `recording`, and returns the
 * result with the requests sent.
 * @example
 * const { result, sent } = await pollOnce(recordedPostHog('counts.json'));
 * // result: { events: [], gauges: { crowd: 14, daily: 37 }, cursor: null }, sent[0].init.method: 'POST'
 */
async function pollOnce(
  recording: RecordedResponse,
  settings: SourceSettings = KAVELO_POSTHOG,
): Promise<{ result: PollResult; sent: readonly SentRequest[] }> {
  const fake = createFakeFetch(inOrder([recording]));

  const result = await createPostHog().poll({ settings, cursor: null, fetch: fake.fetch, now: FIXTURE_TIME });

  return { result, sent: fake.sent };
}

describe('the PostHog Connector', () => {
  test('runs one counting query on the project, with the personal key', async () => {
    const { sent } = await pollOnce(recordedPostHog('counts.json'));

    expect(sent).toHaveLength(1);
    expect(sent[0]?.url).toBe('https://eu.posthog.com/api/projects/12345/query/');
    expect(sent[0]?.init).toMatchObject({
      method: 'POST',
      headers: { Authorization: 'Bearer phx_kavelo-personal-key-for-tests', 'Content-Type': 'application/json' },
    });
  });

  test('counts afresh in the query, never selects rows, and sends the sign-up event as a value', async () => {
    const { sent } = await pollOnce(recordedPostHog('counts.json'));

    const body = v.parse(QUERY_BODY, JSON.parse(sent[0]?.init.body ?? '{}'));

    expect(body.query.kind).toBe('HogQLQuery');
    expect(body.refresh).toBe('force_blocking');
    expect(body.query.values).toEqual({ signup: 'user_signed_up' });
    expect(body.query.query).toMatch(/^SELECT\s+uniqIf\(.+\s+countIf\(/su);
    expect(body.query.query).not.toContain('user_signed_up');
    expect(body.query.query).not.toMatch(/SELECT\s+\*|properties|LIMIT/iu);
  });

  test('turns the two counts into the crowd and today’s count, and never into an Event', async () => {
    const { result } = await pollOnce(recordedPostHog('counts.json'));

    expect(result).toEqual({ events: [], gauges: { crowd: 14, daily: 37 }, cursor: null });
  });

  test('reports the spent query budget as a rate limit until the time PostHog gives', async () => {
    const answer = recordedPostHog('budget-exceeded.json', 429, { 'Retry-After': '42' });

    await expect(pollOnce(answer)).rejects.toMatchObject({
      failure: { kind: 'rate-limit', resetAt: FIXTURE_TIME + 42_000 },
    });
  });

  test('names the Query Read scope when the key lacks it', async () => {
    await expect(pollOnce(recordedPostHog('missing-scope.json', 403))).rejects.toMatchObject({
      failure: { kind: 'permission', permission: 'Query: Read' },
    });
  });

  test.each([
    ['an address that is not HTTPS', { host: 'http://eu.posthog.com' }],
    ['a project ID that is not a number', { project: 'kavelo' }],
    ['no sign-up event', { signupEvent: '  ' }],
  ])('refuses %s before sending anything', async (_, values) => {
    const fake = createFakeFetch(inOrder([]));

    const settings = { ...KAVELO_POSTHOG, values: { ...KAVELO_POSTHOG.values, ...values } };

    await expect(
      createPostHog().poll({ settings, cursor: null, fetch: fake.fetch, now: FIXTURE_TIME }),
    ).rejects.toMatchObject({ failure: { kind: 'invalid-response' } });
    expect(fake.sent).toEqual([]);
  });

  test('reads every value without the spaces around it', async () => {
    const values = { host: ' https://eu.posthog.com ', project: ' 12345 ', signupEvent: ' user_signed_up ' };

    const { sent } = await pollOnce(recordedPostHog('counts.json'), { ...KAVELO_POSTHOG, values });

    expect(sent[0]?.url).toBe('https://eu.posthog.com/api/projects/12345/query/');
    expect(sent[0]?.init.body).toContain('"signup":"user_signed_up"');
  });

  test('queries a self-hosted PostHog at its own address, without a trailing path', async () => {
    const settings = {
      ...KAVELO_POSTHOG,
      values: { ...KAVELO_POSTHOG.values, host: 'https://posthog.kavelo.example/' },
    };

    const { sent } = await pollOnce(recordedPostHog('counts.json'), settings);

    expect(sent[0]?.url).toBe('https://posthog.kavelo.example/api/projects/12345/query/');
  });

  test('reports an answer without its row of counts as an unexpected response', async () => {
    await expect(pollOnce({ status: 200, body: { results: [] } })).rejects.toMatchObject({
      failure: { kind: 'invalid-response' },
    });
  });
});
