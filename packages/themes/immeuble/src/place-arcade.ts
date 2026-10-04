import type { FreeSpot } from '@deskorama/core';
import type { GagEnv } from './gag.ts';

/** The arcade box's sizes in screen pixels, the biggest first; a 300 x 120 strip still holds every line. */
const SIZES = [
  [420, 120],
  [360, 120],
  [300, 120],
] as const;

/**
 * Holds the biggest arcade box that fits for `hold` ms: a big one on the floors first, so the collapse on the roof
 * stays in view, then any size anywhere visible. Returns null when no visible block is free yet.
 * @example
 * placeArcade(env, 10_500); // { x: 480, y: 300, w: 480, h: 180 } with no window; a 300 x 120 strip behind them
 */
export function placeArcade(env: GagEnv, hold: number): FreeSpot | null {
  const near = { x: env.layout.width / 2, y: env.layout.height / 2 };
  const big = env.place.inBand('floors', { w: 480, h: 180, near, hold });
  if (big !== null) return big;

  for (const [w, h] of SIZES) {
    const spot = env.place.anywhere({ w, h, near, hold });
    if (spot !== null) return spot;
  }

  return null;
}
