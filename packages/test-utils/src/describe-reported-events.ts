import { LANGUAGES, type PollResult } from '@deskorama/core';
import { expect, test } from 'vitest';

/** The longest tag a Theme can paint on a prop. */
const MAX_TAG_LENGTH = 16;

/**
 * Registers the tests of a Connector that streams Events: a recorded first poll returns Events complete in every
 * language with a cursor to resume from, and a replay of the same page keeps their ids, so the platform drops it.
 * @example
 * describeReportedEvents(() => connector.poll({ settings, cursor: null, fetch: createFakeFetch(respond).fetch, now }));
 */
export function describeReportedEvents(firstPoll: () => Promise<PollResult>): void {
  test('returns Events with unique ids, a time and their words in every language', async () => {
    const result = await firstPoll();

    expect(result.events.length).toBeGreaterThan(0);
    expect(new Set(result.events.map((event) => event.id)).size).toBe(result.events.length);
    expect(typeof result.cursor).toBe('string');

    for (const event of result.events) {
      expect(Number.isFinite(event.at.getTime())).toBe(true);
      expect(event.source).not.toBe('');

      for (const lang of LANGUAGES) {
        expect(event.text[lang].label).not.toBe('');
        expect(event.text[lang].tag.length).toBeLessThanOrEqual(MAX_TAG_LENGTH);
      }
    }
  });

  test('keeps the ids of a replayed page, so the platform drops the replay', async () => {
    const first = await firstPoll();
    const replay = await firstPoll();

    expect(replay.events.map((event) => event.id)).toEqual(first.events.map((event) => event.id));
  });
}
