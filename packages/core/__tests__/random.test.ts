import { describe, expect, test } from 'vitest';
import { createRandom } from '../src/random.ts';

/**
 * Returns the first `count` draws of a generator seeded with `seed`.
 * @example
 * draws(42, 2); // [0.6011037519201636, 0.44829055899754167]
 */
function draws(seed: number, count: number): number[] {
  const random = createRandom(seed);
  return Array.from({ length: count }, () => random.next());
}

describe('the seeded random generator', () => {
  test('gives the same sequence for the same seed', () => {
    expect(draws(42, 50)).toEqual(draws(42, 50));
  });

  test('gives different sequences for different seeds', () => {
    expect(draws(42, 5)).not.toEqual(draws(43, 5));
  });

  test('stays within [0, 1) and spreads across the range', () => {
    const values = draws(7, 10_000);
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
    const lowHalf = values.filter((value) => value < 0.5).length;
    expect(lowHalf).toBeGreaterThan(4_800);
    expect(lowHalf).toBeLessThan(5_200);
  });
});
