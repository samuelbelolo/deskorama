import type { PollResult } from '@deskorama/core';
import { createFakeFetch, FIXTURE_TIME, inOrder, type RecordedResponse, type SentRequest } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import { createFeed } from '../src/create-feed.ts';
import { recordedPage, TRAMLO_FEED } from './tramlo-feed.ts';

/**
 * Polls the Tramlo Feed `times` times in a row, each poll resuming from the cursor the previous one returned,
 * through a fake `fetch` answering `recordings` in order, and returns every result with the requests sent.
 * @example
 * const { results, sent } = await pollTimes([recordedPage('first-page.json')], 1);
 */
async function pollTimes(
  recordings: readonly RecordedResponse[],
  times: number,
  cursor: string | null = null,
): Promise<{ results: PollResult[]; sent: readonly SentRequest[] }> {
  const fake = createFakeFetch(inOrder(recordings));

  const pollFrom = async (from: string | null, left: number): Promise<PollResult[]> => {
    if (left === 0) return [];

    const result = await createFeed().poll({
      settings: TRAMLO_FEED,
      cursor: from,
      fetch: fake.fetch,
      now: FIXTURE_TIME,
    });

    return [result, ...(await pollFrom(result.cursor, left - 1))];
  };

  return { results: await pollFrom(cursor, times), sent: fake.sent };
}

describe('the Feed', () => {
  test('asks for the Events with the token, then resumes from the cursor the page gave', async () => {
    const { sent } = await pollTimes([recordedPage('first-page.json'), recordedPage('nothing-new.json')], 2);

    expect(sent.map((request) => request.url)).toEqual([
      'https://api.tramlo.example/deskorama/events',
      'https://api.tramlo.example/deskorama/events?cursor=c_1042',
    ]);
    expect(sent[0]?.init.headers).toMatchObject({ Authorization: 'Bearer tramlo-feed-token-for-tests' });
  });

  test('turns each Event of a page into a Source Event, with words in both languages', async () => {
    const { results } = await pollTimes([recordedPage('last-page.json')], 1);

    expect(results[0]?.events).toEqual([
      {
        id: 'deploy_311',
        kind: 'deploy.finished',
        archetype: 'deploy',
        recognised: true,
        rarity: 'notable',
        source: 'Tramlo',
        at: new Date(FIXTURE_TIME),
        step: 'succeeded',
        text: {
          fr: { label: 'Deploy succeeded', detail: 'v2.5.0 in production', tag: 'v2.5.0' },
          en: { label: 'Deploy succeeded', detail: 'v2.5.0 in production', tag: 'v2.5.0' },
        },
      },
    ]);
  });

  test('polls again at once while more Events wait, then follows the backend’s hint', async () => {
    const { results } = await pollTimes([recordedPage('first-page.json'), recordedPage('last-page.json')], 2);

    expect(results.map((result) => result.delay)).toEqual([0, 120_000]);
    expect(results[1]?.gauges).toEqual({ crowd: 12, daily: 37, build: 'ready' });
  });

  test('sends the ETag back for the same cursor, and a 304 brings nothing new and keeps the cursor', async () => {
    const { results, sent } = await pollTimes(
      [recordedPage('nothing-new.json', '"p7"'), { status: 304 }],
      2,
      '{"cursor":"c_1043","etag":null}',
    );

    expect(sent[1]?.init.headers['If-None-Match']).toBe('"p7"');
    expect(results[1]).toEqual({ events: [], cursor: results[0]?.cursor });
  });

  test('forgets the ETag once the cursor moves on, since it describes another answer', async () => {
    const { sent } = await pollTimes([recordedPage('first-page.json', '"p1"'), recordedPage('nothing-new.json')], 2);

    expect(sent[1]?.init.headers['If-None-Match']).toBeUndefined();
  });

  test('starts over from no cursor at once on 410 Gone', async () => {
    const { results, sent } = await pollTimes(
      [{ status: 410 }, recordedPage('first-page.json')],
      2,
      '{"cursor":"c_9","etag":null}',
    );

    expect(results[0]).toEqual({ events: [], cursor: null, delay: 0 });
    expect(sent[1]?.url).toBe('https://api.tramlo.example/deskorama/events');
  });

  test('refuses an address that is not HTTPS, so the token never travels in clear', async () => {
    const fake = createFakeFetch(inOrder([]));
    const settings = { ...TRAMLO_FEED, values: { url: 'http://api.tramlo.example/events' } };

    await expect(
      createFeed().poll({ settings, cursor: null, fetch: fake.fetch, now: FIXTURE_TIME }),
    ).rejects.toMatchObject({
      failure: { kind: 'invalid-response' },
    });
    expect(fake.sent).toEqual([]);
  });

  test('names every Event after the Source as the person named it, whatever the backend sent', async () => {
    const fake = createFakeFetch(() => recordedPage('last-page.json'));
    const settings = { ...TRAMLO_FEED, name: 'Tramlo prod' };

    const result = await createFeed().poll({ settings, cursor: null, fetch: fake.fetch, now: FIXTURE_TIME });

    expect(result.events.map((event) => event.source)).toEqual(['Tramlo prod']);
  });

  test('ignores a poll interval of zero, which would poll in a loop', async () => {
    const page = { status: 200, body: { events: [], next_cursor: 'c_1', has_more: false, poll_interval: 0 } };

    const { results } = await pollTimes([page], 1);

    expect(results[0]?.delay).toBeUndefined();
  });

  test('sets the cursor among the address’s own parameters, before its fragment, and replaces an old one', async () => {
    const fake = createFakeFetch(() => recordedPage('nothing-new.json'));
    const settings = { ...TRAMLO_FEED, values: { url: 'https://api.tramlo.example/events?team=web&cursor=old#top' } };
    const cursor = '{"cursor":"c_1043","etag":null}';

    await createFeed().poll({ settings, cursor, fetch: fake.fetch, now: FIXTURE_TIME });

    expect(fake.sent[0]?.url).toBe('https://api.tramlo.example/events?team=web&cursor=c_1043#top');
  });
});
