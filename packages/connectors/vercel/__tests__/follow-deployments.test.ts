import { FIXTURE_TIME } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { listAnswer, statusAnswer } from './deployment-answers.ts';
import { MINUTE, pollTimes } from './poll-times.ts';

/** A day and an hour: past the day after which a deployment still unfinished is let go. */
const DAY_AND_AN_HOUR = 25 * 60 * MINUTE;

/**
 * Returns `count` preview deployments still building, created a minute apart and ending a minute before the fixture.
 * @example
 * building(2); // [{ uid: 'dpl_0', created: …, readyState: 'BUILDING' }, { uid: 'dpl_1', … }]
 */
function building(count: number): { uid: string; created: number; readyState: string }[] {
  return Array.from({ length: count }, (_, index) => ({
    uid: `dpl_${index}`,
    created: FIXTURE_TIME - (count - index) * MINUTE,
    readyState: 'BUILDING',
  }));
}

describe('the Vercel Connector following unfinished deployments', () => {
  test('counts the deploys in progress as the crowd', async () => {
    const start = listAnswer([
      { uid: 'dpl_1', created: FIXTURE_TIME - MINUTE, readyState: 'BUILDING', target: 'production' },
    ]);

    const { results } = await pollTimes([start, listAnswer([]), statusAnswer('dpl_1', 'READY', FIXTURE_TIME)], 2);

    expect(results.map((result) => result.gauges)).toEqual([{ crowd: 1 }, { crowd: 0 }]);
  });

  test('says production is idle again when a started deploy is canceled, which no deploy step tells', async () => {
    const start = listAnswer([
      { uid: 'dpl_1', created: FIXTURE_TIME - MINUTE, readyState: 'QUEUED', target: 'production' },
    ]);

    const { results } = await pollTimes([start, listAnswer([]), statusAnswer('dpl_1', 'CANCELED')], 2);

    expect(results[1]?.events.map((event) => event.kind)).toEqual(['deployment.canceled']);
    expect(results[1]?.gauges).toEqual({ crowd: 0, build: 'idle' });
  });

  test('tells the ends of several deploys in the order they ended, not the order they started', async () => {
    const start = listAnswer([
      { uid: 'dpl_b', created: FIXTURE_TIME - 5 * MINUTE, readyState: 'BUILDING', target: 'production' },
      { uid: 'dpl_a', created: FIXTURE_TIME - 10 * MINUTE, readyState: 'BUILDING', target: 'production' },
    ]);

    const { results } = await pollTimes(
      [
        start,
        listAnswer([]),
        statusAnswer('dpl_a', 'ERROR', FIXTURE_TIME + 50_000),
        statusAnswer('dpl_b', 'READY', FIXTURE_TIME + 10_000),
      ],
      2,
    );

    expect(results[1]?.events.map((event) => event.id)).toEqual([
      'dpl_b-deployment.succeeded',
      'dpl_a-deployment.failed',
    ]);
  });

  test('reads ten unfinished deployments a poll, in turn, so none waits for ever', async () => {
    const stillBuilding = Array.from({ length: 10 }, (_, index) => statusAnswer(`dpl_${index}`, 'BUILDING'));

    const { sent } = await pollTimes(
      [
        listAnswer(building(11)),
        listAnswer([]),
        ...stillBuilding,
        listAnswer([]),
        statusAnswer('dpl_10', 'READY'),
        ...stillBuilding.slice(0, 9),
      ],
      3,
    );

    const read = sent.map((request) => request.url).filter((url) => url.includes('/v13/'));

    expect(read.slice(0, 10)).toEqual(
      Array.from({ length: 10 }, (_, index) => expect.stringContaining(`dpl_${index}`)),
    );
    expect(read[10]).toContain('dpl_10');
  });

  test('follows every unfinished deployment of a burst, with no cap', async () => {
    const { results } = await pollTimes([listAnswer(building(21))], 1);

    expect(results[0]?.gauges).toEqual({ crowd: 21 });
  });

  test('reads a deploy again after a long sleep before letting it go, so its end is still told', async () => {
    const start = listAnswer([
      { uid: 'dpl_1', created: FIXTURE_TIME - MINUTE, readyState: 'BUILDING', target: 'production' },
    ]);

    const { results } = await pollTimes([start], 1);

    const ended = await pollTimes(
      [listAnswer([]), statusAnswer('dpl_1', 'READY', FIXTURE_TIME + 5 * MINUTE)],
      1,
      results[0]?.cursor ?? null,
      FIXTURE_TIME + DAY_AND_AN_HOUR,
    );

    const stuck = await pollTimes(
      [listAnswer([]), statusAnswer('dpl_1', 'BUILDING')],
      1,
      results[0]?.cursor ?? null,
      FIXTURE_TIME + DAY_AND_AN_HOUR,
    );

    expect(ended.results[0]?.events.map((event) => event.kind)).toEqual(['deployment.succeeded']);
    expect(stuck.results[0]?.gauges).toEqual({ crowd: 0, build: 'idle' });
  });

  test('holds a catch-up’s Events until its last page, so an old failure never plays after a newer success', async () => {
    const newer = listAnswer(
      [
        {
          uid: 'dpl_2',
          created: FIXTURE_TIME - 10 * MINUTE,
          readyState: 'READY',
          target: 'production',
          ready: FIXTURE_TIME - 8 * MINUTE,
        },
      ],
      FIXTURE_TIME - 30 * MINUTE,
    );

    const older = listAnswer([
      {
        uid: 'dpl_1',
        created: FIXTURE_TIME - 40 * MINUTE,
        readyState: 'ERROR',
        target: 'production',
        ready: FIXTURE_TIME - 38 * MINUTE,
      },
    ]);

    const { results } = await pollTimes([newer, older], 2);

    expect(results.map((result) => result.events.map((event) => event.kind))).toEqual([
      [],
      ['deployment.failed', 'deployment.succeeded'],
    ]);
  });
});
