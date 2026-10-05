import type { ConnectorOption, SourceSettings } from '@deskorama/core';
import { createFakeFetch, FIXTURE_TIME, inOrder, type RecordedResponse, type SentRequest } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createPostHog } from '../src/create-posthog.ts';
import { askedOf } from './asked-of.ts';
import { KAVELO_POSTHOG, KAVELO_SIGNUPS, recordedPostHog } from './kavelo-posthog.ts';
import { pollOnce } from './poll-once.ts';

/**
 * Loads the event names of Kavelo's project, through a fake `fetch` answering `recording`, and returns them with the
 * requests sent.
 * @example
 * const { options } = await listNames(recordedPostHog('event-names.json'));
 */
async function listNames(
  recording: RecordedResponse,
  settings: SourceSettings = KAVELO_SIGNUPS,
): Promise<{ options: readonly ConnectorOption[]; sent: readonly SentRequest[] }> {
  const fake = createFakeFetch(inOrder([recording]));

  const input = { field: 'signupEvents', settings, fetch: fake.fetch, now: FIXTURE_TIME };

  const options = (await createPostHog().listOptions?.(input)) ?? [];

  return { options, sent: fake.sent };
}

describe('the PostHog Connector with several sign-up events', () => {
  test('counts the sign-ups under any of the picked events, each name sent as a value', async () => {
    const { sent } = await pollOnce(recordedPostHog('counts.json'), KAVELO_SIGNUPS);

    const asked = askedOf(sent);

    expect(asked.query.values).toEqual({ signup_0: 'user_signed_up', signup_1: 'team_created' });
    expect(asked.query.query).toContain('countIf((event = {signup_0} OR event = {signup_1}) AND ');
    expect(asked.query.query).not.toMatch(/user_signed_up|team_created/u);
  });

  test('still counts the one sign-up event of a Source saved before several could be picked', async () => {
    const { sent } = await pollOnce(recordedPostHog('counts.json'), KAVELO_POSTHOG);

    const asked = askedOf(sent);

    expect(asked.query.values).toEqual({ signup_0: 'user_signed_up' });
  });
});

describe('the event names the PostHog Connector lists', () => {
  test('are asked for with one grouped query on the project: names, never a row per event', async () => {
    const { sent } = await listNames(recordedPostHog('event-names.json'));

    const asked = askedOf(sent);

    expect(sent).toHaveLength(1);
    expect(sent[0]?.url).toBe('https://eu.posthog.com/api/projects/12345/query/');
    expect(sent[0]?.init.headers).toMatchObject({ Authorization: 'Bearer phx_kavelo-personal-key-for-tests' });
    expect(asked.query.query).toMatch(
      /^SELECT event\s+FROM events\s+WHERE .+\s+GROUP BY event\s+ORDER BY event LIKE '\$%', count\(\) DESC\s+LIMIT 500$/u,
    );
    expect(asked.query.query).not.toMatch(/SELECT\s+\*|properties|person|distinct_id/iu);
  });

  test('put the product’s own events first, then those PostHog captures by itself', async () => {
    const { options } = await listNames(recordedPostHog('event-names.json'));

    expect(options.map((option) => option.value)).toEqual([
      'invoice_exported',
      'team_created',
      'user_signed_up',
      '$autocapture',
      '$identify',
      '$pageview',
    ]);
  });

  test('leave out a name with spaces around it, which a saved pick would not keep, and an empty one', async () => {
    const answer = { status: 200, body: { results: [['signup '], ['user_signed_up'], ['']] } };

    const { options } = await listNames(answer);

    expect(options).toEqual([{ value: 'user_signed_up', label: 'user_signed_up' }]);
  });

  test('cannot be loaded without the Query Read scope, which is named', async () => {
    await expect(listNames(recordedPostHog('missing-scope.json', 403))).rejects.toMatchObject({
      failure: { kind: 'permission', permission: 'Query: Read' },
    });
  });

  test('are not asked for before the cloud and the project are known', async () => {
    const settings = { ...KAVELO_SIGNUPS, values: { host: 'https://eu.posthog.com', project: '' } };

    await expect(listNames(recordedPostHog('event-names.json'), settings)).rejects.toMatchObject({
      failure: { kind: 'invalid-response' },
    });
  });
});
