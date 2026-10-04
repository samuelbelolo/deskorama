import { createFakeFetch, FIXTURE_TIME, inOrder } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createSentry } from '../src/create-sentry.ts';
import { pollAt, queryOf } from './poll-at.ts';
import { recorded, TRAMLO_SENTRY } from './tramlo-sentry.ts';

describe('the Sentry Connector', () => {
  test('asks for the organization’s unresolved issues seen in the last hour and a margin, latest first, with the token', async () => {
    const { sent } = await pollAt([recorded('issues-last-hour.json')], [0]);

    const url = new URL(sent[0]?.url ?? '');

    expect(url.origin + url.pathname).toBe('https://sentry.io/api/0/organizations/tramlo/issues/');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      query: 'is:unresolved lastSeen:-70m',
      sort: 'date',
      statsPeriod: '14d',
      limit: '100',
    });
    expect(sent[0]?.init.headers).toMatchObject({ Authorization: 'Bearer tramlo-sentry-token-for-tests' });
  });

  test('plays a new error and a recurring one, oldest first, in both languages', async () => {
    const { results } = await pollAt([recorded('issues-last-hour.json')], [0]);

    const events = results[0]?.events ?? [];

    expect(events[0]).toEqual({
      id: '4821-new',
      kind: 'issue.new',
      archetype: 'error',
      recognised: true,
      rarity: 'notable',
      source: 'Tramlo',
      at: new Date('2026-10-04T13:48:12Z'),
      gauge: { role: 'daily', by: 1 },
      text: {
        fr: { label: 'Nouvelle erreur', detail: 'TRAMLO-WEB-3F · TypeError', tag: 'NOUVELLE' },
        en: { label: 'New error', detail: 'TRAMLO-WEB-3F · TypeError', tag: 'NEW' },
      },
    });
    expect(events[1]).toMatchObject({
      id: '3907-recurring-2026-10-04T13',
      kind: 'issue.recurring',
      rarity: 'common',
      at: new Date('2026-10-04T13:52:05Z'),
      text: {
        fr: { label: 'Erreur récurrente', detail: 'TRAMLO-API-1K · TimeoutError, 1342 occurrences', tag: '1342 FOIS' },
        en: { label: 'Recurring error', detail: 'TRAMLO-API-1K · TimeoutError, 1342 events', tag: '1342 TIMES' },
      },
    });
  });

  test('never words an Event with the error’s message, which may quote a person’s data', async () => {
    const { results } = await pollAt([recorded('issues-last-hour.json')], [0]);

    const words = JSON.stringify(results[0]?.events.map((event) => event.text));

    expect(words).not.toContain('Cannot read');
    expect(words).not.toContain('Query read timeout');
  });

  test('resumes from the latest time Sentry saw an error, whatever the Mac’s clock says', async () => {
    const { results, sent } = await pollAt([recorded('issues-last-hour.json'), { status: 200, body: [] }], [0, 1]);

    expect(JSON.parse(results[0]?.cursor ?? 'null')).toMatchObject({ since: Date.parse('2026-10-04T13:57:40Z') });
    expect(queryOf(sent[1])).toBe('is:unresolved lastSeen:-14m');
  });

  test('waits for the reset Sentry announces in its own header when it says nothing else', async () => {
    const limited = { status: 429, headers: { 'X-Sentry-Rate-Limit-Reset': '1791122460' } };

    await expect(pollAt([limited], [0])).rejects.toMatchObject({
      failure: { kind: 'rate-limit', resetAt: 1_791_122_460_000 },
    });
  });

  test('waits a minute when Sentry’s own reset header is empty or already past', async () => {
    const empty = { status: 429, headers: { 'X-Sentry-Rate-Limit-Reset': '' } };

    const past = { status: 429, headers: { 'X-Sentry-Rate-Limit-Reset': '1791122000' } };

    const failures = await Promise.all(
      [empty, past].map((limited) => pollAt([limited], [0]).catch((error: unknown) => error)),
    );

    expect(failures).toMatchObject([
      { failure: { kind: 'rate-limit', resetAt: FIXTURE_TIME + 60_000 } },
      { failure: { kind: 'rate-limit', resetAt: FIXTURE_TIME + 60_000 } },
    ]);
  });

  test('starts over from the last hour when the cursor cannot be read', async () => {
    const { sent } = await pollAt([{ status: 200, body: [] }], [0], '{"since":"yesterday"}');

    expect(queryOf(sent[0])).toBe('is:unresolved lastSeen:-70m');
  });

  test('refuses a Source without its organization, before any request', async () => {
    const fake = createFakeFetch(inOrder([]));

    const settings = { ...TRAMLO_SENTRY, values: {} };

    await expect(
      createSentry().poll({ settings, cursor: null, fetch: fake.fetch, now: FIXTURE_TIME }),
    ).rejects.toMatchObject({ failure: { kind: 'invalid-response' } });
    expect(fake.sent).toEqual([]);
  });
});
