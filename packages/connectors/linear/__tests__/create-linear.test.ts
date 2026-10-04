import type { PollResult } from '@deskorama/core';
import { createFakeFetch, FIXTURE_TIME, inOrder, type RecordedResponse, type SentRequest } from '@deskorama/test-utils';
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createLinear } from '../src/create-linear.ts';
import { errorAnswer, issuesAnswer, recorded, TRAMLO_LINEAR } from './tramlo-linear.ts';

/** One minute, the usual time between two polls. */
const MINUTE = 60_000;

/** The body of a request to Linear's GraphQL API. */
const SENT_BODY = v.object({
  query: v.string(),
  variables: v.object({
    filter: v.object({ updatedAt: v.object({ gt: v.string() }) }),
    after: v.nullable(v.string()),
  }),
});

/**
 * Polls Tramlo's Linear workspace `times` times in a row, a minute apart, each poll resuming from the cursor the
 * previous one returned, through a fake `fetch` answering `recordings` in order.
 * @example
 * const { results, sent } = await pollTimes([recorded('issues-last-hour.json')], 1);
 */
async function pollTimes(
  recordings: readonly RecordedResponse[],
  times: number,
  cursor: string | null = null,
): Promise<{ results: PollResult[]; sent: readonly SentRequest[] }> {
  const fake = createFakeFetch(inOrder(recordings));

  const pollFrom = async (from: string | null, poll: number): Promise<PollResult[]> => {
    if (poll === times) return [];

    const now = FIXTURE_TIME + poll * MINUTE;

    const result = await createLinear().poll({ settings: TRAMLO_LINEAR, cursor: from, fetch: fake.fetch, now });

    return [result, ...(await pollFrom(result.cursor, poll + 1))];
  };

  return { results: await pollFrom(cursor, 0), sent: fake.sent };
}

/**
 * Returns the GraphQL body a request sent to Linear.
 * @example
 * bodyOf(sent[0]).variables.after; // null
 */
function bodyOf(request: SentRequest | undefined): v.InferOutput<typeof SENT_BODY> {
  return v.parse(SENT_BODY, JSON.parse(request?.init.body ?? 'null'));
}

describe('the Linear Connector', () => {
  test('asks for the issues updated in the last hour, with the key as Linear expects a personal key', async () => {
    const { sent } = await pollTimes([recorded('issues-last-hour.json')], 1);

    const body = bodyOf(sent[0]);

    expect(sent[0]?.url).toBe('https://api.linear.app/graphql');
    expect(sent[0]?.init).toMatchObject({ method: 'POST', headers: { Authorization: 'tramlo-linear-key-for-tests' } });
    expect(body.variables).toEqual({ filter: { updatedAt: { gt: '2026-10-04T13:00:00.000Z' } }, after: null });
    expect(body.query).toContain('orderBy: updatedAt');
    expect(body.query).not.toMatch(/assignee|creator|description/u);
  });

  test('plays the issues created and completed, oldest first, and keeps quiet on other edits', async () => {
    const { results } = await pollTimes([recorded('issues-last-hour.json')], 1);

    const events = results[0]?.events ?? [];

    expect(events.map((event) => [event.kind, event.archetype, event.rarity, event.text.en.tag])).toEqual([
      ['issue.created', 'message', 'common', 'ENG-142'],
      ['issue.completed', 'approval', 'notable', 'DONE'],
    ]);
    expect(events[0]?.text).toEqual({
      fr: { label: 'Issue créée', detail: '« Export invoices as CSV »', tag: 'ENG-142' },
      en: { label: 'Issue created', detail: '“Export invoices as CSV”', tag: 'ENG-142' },
    });
    expect(events[1]).toEqual({
      id: 'f3a91d6e-2c87-4b5a-9e13-7d4f0a6c8b21-completed-2026-10-04T13:53:30.120Z',
      kind: 'issue.completed',
      archetype: 'approval',
      recognised: true,
      rarity: 'notable',
      source: 'Tramlo',
      at: new Date('2026-10-04T13:53:30.120Z'),
      gauge: { role: 'daily', by: 1 },
      text: {
        fr: { label: 'Issue terminée', detail: 'ENG-139 Retry failed webhooks', tag: 'TERMINÉE' },
        en: { label: 'Issue completed', detail: 'ENG-139 Retry failed webhooks', tag: 'DONE' },
      },
    });
  });

  test('resumes after the newest update Linear gave', async () => {
    const { sent } = await pollTimes([recorded('issues-last-hour.json'), issuesAnswer([])], 2);

    expect(bodyOf(sent[1]).variables.filter.updatedAt.gt).toBe('2026-10-04T13:57:12.004Z');
  });

  test('reads a busy hour page after page from the same starting point, then moves on', async () => {
    const first = issuesAnswer(
      [{ id: '2', createdAt: '2026-10-04T13:20:00Z', updatedAt: '2026-10-04T13:50:00Z' }],
      'p1',
    );

    const last = issuesAnswer([{ id: '1', createdAt: '2026-10-04T13:10:00Z', updatedAt: '2026-10-04T13:30:00Z' }]);

    const { results, sent } = await pollTimes([first, last, issuesAnswer([])], 3);

    expect(results.map((result) => result.delay)).toEqual([0, undefined, undefined]);
    expect(sent.map((request) => bodyOf(request).variables)).toEqual([
      { filter: { updatedAt: { gt: '2026-10-04T13:00:00.000Z' } }, after: null },
      { filter: { updatedAt: { gt: '2026-10-04T13:00:00.000Z' } }, after: 'p1' },
      { filter: { updatedAt: { gt: '2026-10-04T13:50:00Z' } }, after: null },
    ]);
  });

  test('plays an issue created and completed between two polls twice, and again when it is completed anew', async () => {
    const done = { id: '7', createdAt: '2026-10-04T13:20:00Z', state: 'completed' };

    const { results } = await pollTimes(
      [
        issuesAnswer([{ ...done, updatedAt: '2026-10-04T13:40:00Z', completedAt: '2026-10-04T13:40:00Z' }]),
        issuesAnswer([{ ...done, updatedAt: '2026-10-04T14:00:30Z', completedAt: '2026-10-04T14:00:30Z' }]),
      ],
      2,
    );

    expect(results.map((result) => result.events.map((event) => event.id))).toEqual([
      ['7-created', '7-completed-2026-10-04T13:40:00Z'],
      ['7-completed-2026-10-04T14:00:30Z'],
    ]);
  });

  test.each([
    ['authentication error', { kind: 'auth' }],
    ['forbidden', { kind: 'permission', permission: 'Read' }],
    ['invalid input', { kind: 'invalid-response' }],
  ])('reads the GraphQL error “%s” Linear answers with 400', async (type, failure) => {
    await expect(pollTimes([errorAnswer(type)], 1)).rejects.toMatchObject({ failure });
  });

  test('waits for the reset Linear announces, in milliseconds, when it limits the rate', async () => {
    const limited = errorAnswer('ratelimited', { 'X-RateLimit-Requests-Reset': String(FIXTURE_TIME + 15 * MINUTE) });

    await expect(pollTimes([limited], 1)).rejects.toMatchObject({
      failure: { kind: 'rate-limit', resetAt: FIXTURE_TIME + 15 * MINUTE },
    });
  });

  test('cuts a long title at a word, and leaves out a tag too long to paint', async () => {
    const long = 'Move every invoice export to the background queue so the dashboard never freezes on large accounts';

    const answer = issuesAnswer([
      {
        id: '9',
        createdAt: '2026-10-04T13:41:07.512Z',
        updatedAt: '2026-10-04T13:41:07.512Z',
        identifier: 'PLATFORM-1042',
        title: long,
      },
    ]);

    const { results } = await pollTimes([answer], 1);

    expect(results[0]?.events[0]?.text.en).toEqual({
      label: 'Issue created',
      detail: '“Move every invoice export to the background queue so the dashboard never freezes…”',
      tag: '',
    });
  });

  test('still tells an issue that slipped past a catch-up while its pages were read', async () => {
    const first = issuesAnswer(
      [{ id: '2', createdAt: '2026-10-04T13:20:00Z', updatedAt: '2026-10-04T13:50:00Z' }],
      'p1',
    );

    const { results } = await pollTimes(
      [
        first,
        issuesAnswer([]),
        issuesAnswer([{ id: '3', createdAt: '2026-10-04T13:10:00Z', updatedAt: '2026-10-04T14:01:30Z' }]),
      ],
      3,
    );

    expect(results.map((result) => result.events.map((event) => event.id))).toEqual([['2-created'], [], ['3-created']]);
  });

  test('waits for the reset of the quota Linear ran out of, not of another one', async () => {
    const limited = errorAnswer('ratelimited', {
      'X-RateLimit-Requests-Remaining': '2400',
      'X-RateLimit-Requests-Reset': String(FIXTURE_TIME + MINUTE),
      'X-RateLimit-Complexity-Remaining': '0',
      'X-RateLimit-Complexity-Reset': String(FIXTURE_TIME + 15 * MINUTE),
    });

    await expect(pollTimes([limited], 1)).rejects.toMatchObject({
      failure: { kind: 'rate-limit', resetAt: FIXTURE_TIME + 15 * MINUTE },
    });
  });

  test('starts over from the last hour when the cursor cannot be read', async () => {
    const { sent } = await pollTimes([issuesAnswer([])], 1, '{"since":"later"}');

    expect(bodyOf(sent[0]).variables.filter.updatedAt.gt).toBe('2026-10-04T13:00:00.000Z');
  });
});
