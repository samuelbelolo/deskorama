import { describe, expect, test } from 'vitest';
import { checkForRelease } from '../src/main/check-for-release.ts';
import type { CheckOutcome } from '../src/main/watch-releases.ts';

/**
 * Returns the states the menu line goes through for a check that ends in `outcome`.
 * @example
 * await shownFor('none'); // ['checking', 'none']
 */
async function shownFor(outcome: CheckOutcome): Promise<string[]> {
  const shown: string[] = [];

  await checkForRelease({ check: async () => outcome }, (state) => shown.push(state));

  return shown;
}

describe('a check for a newer release asked from the menu', () => {
  test('says it is asking, then what it came back with', async () => {
    expect(await shownFor('none')).toEqual(['checking', 'none']);
    expect(await shownFor('unreachable')).toEqual(['checking', 'unreachable']);
  });

  test('is ready to be asked again once a newer release is known, whose download takes the line', async () => {
    expect(await shownFor('newer')).toEqual(['checking', 'ready']);
  });
});
