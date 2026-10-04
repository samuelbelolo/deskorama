import { createRandom } from '@deskorama/core';

/** Where one suitcase lies on the pile, and its tilt in degrees. */
export interface PileSlot {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

/** How many suitcases each row of the pile holds, from the ground up. */
const ROWS = [6, 5, 3, 2, 1] as const;

/** The seed of the pile's shape, so it stacks the same on every run. */
const SHAPE_SEED = 17;

/**
 * Returns the places of the pile's suitcases, a lopsided pyramid with small tilts, filled from the ground up.
 * @example
 * pileSlots({ x: 16, feetY: 740 }).length; // 17
 */
export function pileSlots(pile: { readonly x: number; readonly feetY: number }): PileSlot[] {
  const random = createRandom(SHAPE_SEED);

  return ROWS.flatMap((n, row) =>
    Array.from({ length: n }, (_, i) => ({
      x: pile.x + row * 5 + i * 11 + random.next() * 2,
      y: pile.feetY - 9 - row * 7.4,
      r: (random.next() - 0.5) * 22,
    })),
  );
}
