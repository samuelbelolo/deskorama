import { describe, expect, test } from 'vitest';
import { pickWeighted } from '../src/pick-weighted.ts';
import { createRandom } from '../src/random.ts';

/**
 * Returns how many times each index was drawn over `draws` draws.
 * @example
 * tally([1, 3], 400); // about [100, 300]
 */
function tally(weights: readonly number[], draws: number): number[] {
  const random = createRandom(11);
  const counts = weights.map(() => 0);

  for (let draw = 0; draw < draws; draw += 1) {
    const index = pickWeighted(weights, random);
    counts[index] = (counts[index] ?? 0) + 1;
  }

  return counts;
}

describe('a weighted draw', () => {
  test('never draws a weight of zero', () => {
    expect(tally([0, 5, 0], 200)).toEqual([0, 200, 0]);
  });

  test('draws each weight in proportion to its value', () => {
    const [small = 0, large = 0] = tally([1, 3], 4000);

    expect(small / 4000).toBeCloseTo(0.25, 1);
    expect(large / 4000).toBeCloseTo(0.75, 1);
  });

  test('returns -1 when nothing can be drawn', () => {
    expect(pickWeighted([], createRandom(1))).toBe(-1);
    expect(pickWeighted([0, 0], createRandom(1))).toBe(-1);
  });
});
