import { createFakeFetch, FIXTURE_TIME, inOrder } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createVercel } from '../src/create-vercel.ts';
import { listAnswer, statusAnswer } from './deployment-answers.ts';
import { MINUTE, pollTimes } from './poll-times.ts';
import { recorded, TRAMLO_VERCEL } from './tramlo-vercel.ts';

/** The production deploy still building in the recorded list. */
const BUILDING_ID = 'dpl_3kVq8TzR1mWn6YbH2cXe9LpA';

describe('the Vercel Connector', () => {
  test('asks for the project’s deployments of the last hour, with the token', async () => {
    const { sent } = await pollTimes([recorded('deployments-last-hour.json')], 1);

    expect(sent[0]?.url).toBe(
      `https://api.vercel.com/v7/deployments?projectId=tramlo-web&since=${FIXTURE_TIME - 60 * MINUTE}&limit=20`,
    );
    expect(sent[0]?.init.headers).toMatchObject({ Authorization: 'Bearer tramlo-vercel-token-for-tests' });
  });

  test('plays a production deploy’s steps and a preview’s end, oldest first, in both languages', async () => {
    const { results } = await pollTimes([recorded('deployments-last-hour.json')], 1);

    const events = results[0]?.events ?? [];

    expect(events.map((event) => [event.kind, event.archetype, event.step, event.rarity])).toEqual([
      ['deployment.succeeded', 'deploy', 'succeeded', 'notable'],
      ['preview.ready', 'publish', undefined, 'common'],
      ['deployment.started', 'deploy', 'started', 'notable'],
    ]);
    expect(events[0]).toEqual({
      id: 'dpl_5RtY9uIo2PaS4dFg6HjK8lZx-deployment.succeeded',
      kind: 'deployment.succeeded',
      archetype: 'deploy',
      recognised: true,
      rarity: 'notable',
      source: 'Tramlo',
      at: new Date(FIXTURE_TIME - 45 * MINUTE),
      step: 'succeeded',
      gauge: { role: 'daily', by: 1 },
      text: {
        fr: { label: 'Mise en ligne réussie', detail: 'tramlo-web · main', tag: 'EN LIGNE' },
        en: { label: 'Deploy succeeded', detail: 'tramlo-web · main', tag: 'LIVE' },
      },
    });
    expect(events[1]?.text.en.detail).toBe('tramlo-web · feature/dark-mode');
  });

  test('follows an unfinished deploy by its id until it fails, the legendary scene', async () => {
    const { results, sent } = await pollTimes(
      [recorded('deployments-last-hour.json'), listAnswer([]), recorded('deployment-failed.json')],
      2,
    );

    expect(sent.map((request) => request.url)).toEqual([
      expect.stringContaining('/v7/deployments?'),
      `https://api.vercel.com/v7/deployments?projectId=tramlo-web&since=${FIXTURE_TIME - 5 * MINUTE}&limit=20`,
      `https://api.vercel.com/v13/deployments/${BUILDING_ID}`,
    ]);
    expect(results[1]?.events).toMatchObject([
      {
        id: `${BUILDING_ID}-deployment.failed`,
        archetype: 'deploy',
        step: 'failed',
        rarity: 'jackpot',
        at: new Date(FIXTURE_TIME - 2 * MINUTE),
        text: { fr: { label: 'Mise en ligne ratée', tag: 'RATÉE' }, en: { label: 'Deploy failed', tag: 'FAILED' } },
      },
    ]);
  });

  test('tells a start once, however long the build takes, then its success', async () => {
    const start = listAnswer([
      { uid: 'dpl_1', created: FIXTURE_TIME - MINUTE, readyState: 'QUEUED', target: 'production' },
    ]);

    const { results } = await pollTimes(
      [start, listAnswer([]), statusAnswer('dpl_1', 'BUILDING'), listAnswer([]), statusAnswer('dpl_1', 'READY')],
      3,
    );

    expect(results.map((result) => result.events.map((event) => event.kind))).toEqual([
      ['deployment.started'],
      [],
      ['deployment.succeeded'],
    ]);
  });

  test('polls sooner while a deploy builds, and at the person’s interval once it is over', async () => {
    const start = listAnswer([
      { uid: 'dpl_1', created: FIXTURE_TIME - MINUTE, readyState: 'BUILDING', target: 'production' },
    ]);

    const { results } = await pollTimes([start, listAnswer([]), statusAnswer('dpl_1', 'READY', FIXTURE_TIME)], 2);

    expect(results.map((result) => result.delay)).toEqual([30_000, undefined]);
  });

  test('stops following a deployment Vercel no longer knows', async () => {
    const start = listAnswer([
      { uid: 'dpl_1', created: FIXTURE_TIME - MINUTE, readyState: 'BUILDING', target: 'production' },
    ]);

    const { results, sent } = await pollTimes([start, listAnswer([]), { status: 404 }, listAnswer([])], 3);

    expect(results.map((result) => result.events.length)).toEqual([1, 0, 0]);
    expect(sent.map((request) => request.url.split('?')[0])).toEqual([
      'https://api.vercel.com/v7/deployments',
      'https://api.vercel.com/v7/deployments',
      'https://api.vercel.com/v13/deployments/dpl_1',
      'https://api.vercel.com/v7/deployments',
    ]);
  });

  test('reads a burst page after page, then lists from the newest deployment', async () => {
    const newer = listAnswer(
      [{ uid: 'dpl_2', created: FIXTURE_TIME - 10 * MINUTE, readyState: 'READY' }],
      FIXTURE_TIME - 30 * MINUTE,
    );

    const older = listAnswer([{ uid: 'dpl_1', created: FIXTURE_TIME - 40 * MINUTE, readyState: 'READY' }]);

    const { results, sent } = await pollTimes([newer, older, listAnswer([])], 3);

    expect(results.map((result) => result.delay)).toEqual([0, undefined, undefined]);
    expect(sent.map((request) => new URL(request.url).searchParams.get('until'))).toEqual([
      null,
      String(FIXTURE_TIME - 30 * MINUTE),
      null,
    ]);
    expect(sent.map((request) => new URL(request.url).searchParams.get('since'))).toEqual([
      String(FIXTURE_TIME - 60 * MINUTE),
      String(FIXTURE_TIME - 60 * MINUTE),
      String(FIXTURE_TIME - 10 * MINUTE),
    ]);
  });

  test('turns a canceled deploy into an abandon and a broken preview into an error, and keeps quiet on a preview that starts', async () => {
    const list = listAnswer([
      { uid: 'dpl_3', created: FIXTURE_TIME - 3 * MINUTE, readyState: 'BUILDING' },
      { uid: 'dpl_2', created: FIXTURE_TIME - 6 * MINUTE, readyState: 'ERROR' },
      { uid: 'dpl_1', created: FIXTURE_TIME - 9 * MINUTE, readyState: 'CANCELED', target: 'production' },
    ]);

    const { results } = await pollTimes([list], 1);

    expect(results[0]?.events.map((event) => [event.kind, event.archetype, event.rarity])).toEqual([
      ['deployment.canceled', 'abandon', 'common'],
      ['preview.failed', 'error', 'common'],
    ]);
  });

  test('starts over from the last hour when the cursor cannot be read', async () => {
    const { sent } = await pollTimes([listAnswer([])], 1, 'not a cursor');

    expect(new URL(sent[0]?.url ?? '').searchParams.get('since')).toBe(String(FIXTURE_TIME - 60 * MINUTE));
  });

  test('refuses a Source without its project, before any request', async () => {
    const fake = createFakeFetch(inOrder([]));

    const settings = { ...TRAMLO_VERCEL, values: {} };

    await expect(
      createVercel().poll({ settings, cursor: null, fetch: fake.fetch, now: FIXTURE_TIME }),
    ).rejects.toMatchObject({ failure: { kind: 'invalid-response' } });
    expect(fake.sent).toEqual([]);
  });
});
