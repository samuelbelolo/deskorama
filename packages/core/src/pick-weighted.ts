import type { Random } from './random.ts';

/**
 * Returns the index of one weight drawn at random in proportion to its value, or -1 when no weight is above zero.
 * A weight of zero is never drawn.
 * @example
 * pickWeighted([0, 300, 100], createRandom(7)); // 1 three times out of four, 2 otherwise, never 0
 * pickWeighted([0, 0], createRandom(7)); // -1
 */
export function pickWeighted(weights: readonly number[], random: Random): number {
  const total = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0);
  if (total <= 0) return -1;

  let roll = random.next() * total;

  for (const [index, weight] of weights.entries()) {
    if (weight <= 0) continue;
    roll -= weight;
    if (roll < 0) return index;
  }

  // Rounding can leave a sliver past the last weight: it belongs to the last one drawable.
  return weights.findLastIndex((weight) => weight > 0);
}
