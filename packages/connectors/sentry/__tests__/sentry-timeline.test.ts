import { describe, expect, test } from 'vitest';
import { playedIds, pollAt } from './poll-at.ts';
import { issuesAnswer, sentryIssue } from './tramlo-sentry.ts';

describe('the Sentry Connector over time', () => {
  test('plays a recurring error at most once an hour, and not in the hour it was new', async () => {
    const first = '2026-10-04T14:01:00Z';

    const { results } = await pollAt(
      [
        issuesAnswer([sentryIssue('77', { firstSeen: first, lastSeen: first })]),
        issuesAnswer([sentryIssue('77', { firstSeen: first, lastSeen: '2026-10-04T14:20:00Z', count: '6' })]),
        issuesAnswer([sentryIssue('77', { firstSeen: first, lastSeen: '2026-10-04T15:03:00Z', count: '9' })]),
        issuesAnswer([sentryIssue('77', { firstSeen: first, lastSeen: '2026-10-04T15:40:00Z', count: '14' })]),
      ],
      [2, 21, 64, 101],
    );

    expect(playedIds(results)).toEqual(['77-new', '77-recurring-2026-10-04T15']);
  });

  test('tells a new error and its return on their own, even when both fall in one poll', async () => {
    const { results } = await pollAt(
      [
        issuesAnswer([sentryIssue('77', { firstSeen: '2026-10-04T14:01:00Z', lastSeen: '2026-10-04T14:01:00Z' })]),
        issuesAnswer([
          sentryIssue('78', { firstSeen: '2026-10-04T15:04:00Z', lastSeen: '2026-10-04T15:04:00Z' }),
          sentryIssue('77', { firstSeen: '2026-10-04T14:01:00Z', lastSeen: '2026-10-04T15:03:00Z', count: '2' }),
        ]),
      ],
      [2, 65],
    );

    expect(results.map((result) => result.events.map((event) => event.id))).toEqual([
      ['77-new'],
      ['77-recurring-2026-10-04T15', '78-new'],
    ]);
  });

  test('plays an old error back after a quiet fortnight as recurring, with its whole-life count', async () => {
    const back = sentryIssue('12', {
      firstSeen: '2026-10-04T13:55:00Z',
      lastSeen: '2026-10-04T13:55:00Z',
      count: '214',
      lifetimeFirstSeen: '2026-08-11T09:30:00Z',
    });

    const { results } = await pollAt([issuesAnswer([back])], [0]);

    expect(results[0]?.events.map((event) => [event.id, event.text.en.tag])).toEqual([
      ['12-recurring-2026-10-04T13', '214 TIMES'],
    ]);
  });

  test('still plays an error Sentry indexed late, and never one already told', async () => {
    const told = sentryIssue('40', { firstSeen: '2026-10-04T13:57:40Z', lastSeen: '2026-10-04T13:57:40Z' });

    const late = sentryIssue('41', { firstSeen: '2026-10-04T13:56:00Z', lastSeen: '2026-10-04T13:56:00Z' });

    const { results } = await pollAt([issuesAnswer([told]), issuesAnswer([told, late])], [0, 1]);

    expect(results.map((result) => result.events.map((event) => event.id))).toEqual([['40-new'], ['41-new']]);
  });

  test('reads a burst page after page from the same starting point, then moves on', async () => {
    const newer = sentryIssue('2', { firstSeen: '2026-10-04T13:50:00Z', lastSeen: '2026-10-04T13:50:00Z' });

    const older = sentryIssue('1', { firstSeen: '2026-10-04T13:20:00Z', lastSeen: '2026-10-04T13:20:00Z' });

    const { results, sent } = await pollAt(
      [issuesAnswer([newer], '1791122400000:0:0'), issuesAnswer([older]), issuesAnswer([])],
      [0, 0, 1],
    );

    expect(playedIds(results)).toEqual(['2-new', '1-new']);
    expect(results.map((result) => result.delay)).toEqual([0, undefined, undefined]);
    expect(sent.map((request) => new URL(request.url).searchParams.get('cursor'))).toEqual([
      null,
      '1791122400000:0:0',
      null,
    ]);
    expect(JSON.parse(results[1]?.cursor ?? 'null')).toMatchObject({ since: Date.parse('2026-10-04T13:50:00Z') });
  });
});
