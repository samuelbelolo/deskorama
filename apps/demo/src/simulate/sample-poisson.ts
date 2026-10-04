import type { Random } from '@deskorama/core';

/**
 * Draws how many Events happen in a stretch of time where `expected` of them are due on average (a Poisson draw),
 * with the seeded generator.
 * @example
 * samplePoisson(random, 0.01); // almost always 0, sometimes 1
 * samplePoisson(random, 3); // around 3
 */
export function samplePoisson(random: Random, expected: number): number {
  if (expected <= 0) return 0;

  // Past about 30, the product below underflows; a normal draw around the mean is close enough.
  if (expected > 30) {
    const normal = Math.sqrt(-2 * Math.log(1 - random.next())) * Math.cos(2 * Math.PI * random.next());

    return Math.max(0, Math.round(expected + Math.sqrt(expected) * normal));
  }

  const limit = Math.exp(-expected);
  let count = 0;
  let product = random.next();

  while (product > limit) {
    count += 1;
    product *= random.next();
  }

  return count;
}
