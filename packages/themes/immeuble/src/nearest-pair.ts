/**
 * Returns the closest pair of coordinates between two spans on one axis: their facing edges when apart, the middle
 * of their overlap when they overlap.
 * @example
 * nearestPair(0, 10, 20, 30); // [10, 20]
 * nearestPair(0, 10, 4, 30); // [7, 7]
 */
export function nearestPair(a0: number, a1: number, b0: number, b1: number): readonly [number, number] {
  if (a1 < b0) return [a1, b0];
  if (b1 < a0) return [a0, b1];

  const mid = Math.round((Math.max(a0, b0) + Math.min(a1, b1)) / 2);

  return [mid, mid];
}
