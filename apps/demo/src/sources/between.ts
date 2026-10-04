import type { Random } from '@deskorama/core';

/**
 * Returns a whole number from `min` to `max` included, rounded to `step`, drawn with the seeded generator.
 * @example
 * between(createRandom(1), 2, 5); // 2, 3, 4 or 5, the same for the same seed
 * between(createRandom(1), 40, 160, 10); // a multiple of 10 from 40 to 160
 */
export function between(random: Random, min: number, max: number, step = 1): number {
  const value = min + random.next() * (max - min);

  return Math.round(value / step) * step;
}
