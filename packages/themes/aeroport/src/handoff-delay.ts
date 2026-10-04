import type { WallpaperEvent } from '@deskorama/core';
import { christeningDelay } from './christening-delay.ts';
import { TIMING } from './flight-geometry.ts';

/**
 * Returns when the PROD flight reaches the screen on the right of the terminal, in milliseconds from the deploy's
 * success: the wait for its name, the roll, and the climb up to its last stretch.
 * @example
 * handoffDelay(deploySucceeded); // 4700 for a deploy tagged "v2.5.0"
 */
export function handoffDelay(event: WallpaperEvent): number {
  return christeningDelay(event) + TIMING.roll + TIMING.climb - TIMING.handoff;
}
