import { describe, expect, test } from 'vitest';
import { chosenIntervalBounds } from '../src/main/sources/chosen-interval-bounds.ts';
import { nextPollDelay } from '../src/main/sources/next-poll-delay.ts';

const FEED = { min: 30_000, default: 60_000, max: 900_000 };

describe('the polling interval a person chooses', () => {
  test('becomes the usual wait, held within the Connector’s bounds', () => {
    expect(chosenIntervalBounds(FEED, 120_000)).toEqual({ min: 120_000, default: 120_000, max: 900_000 });
    expect(chosenIntervalBounds(FEED, 5000).default).toBe(30_000);
    expect(chosenIntervalBounds(FEED, 3_600_000).default).toBe(900_000);
    expect(chosenIntervalBounds(FEED, undefined)).toBe(FEED);
  });

  test('is never cut short by a hint to poll sooner, but a longer hint and a page that has more still apply', () => {
    const bounds = chosenIntervalBounds(FEED, 120_000);

    expect(nextPollDelay({ ok: true, delay: 40_000, immediateInARow: 0 }, bounds, 0)).toBe(120_000);
    expect(nextPollDelay({ ok: true, delay: 300_000, immediateInARow: 0 }, bounds, 0)).toBe(300_000);
    expect(nextPollDelay({ ok: true, delay: 0, immediateInARow: 1 }, bounds, 0)).toBe(0);
  });
});
