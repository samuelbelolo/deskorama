import type { WallpaperEvent } from '@deskorama/core';
import { NAMED_DELAY, UNNAMED_DELAY } from './flight-geometry.ts';

/**
 * Returns how long the PROD flight waits at the threshold before it rolls: long enough for the deploy's tag to be
 * painted on as its name, or a moment when there is none. The terminal and the screen on its right both count from
 * it, so the plane leaves one and enters the other at the same instant.
 * @example
 * christeningDelay(deploySucceeded); // 900 for a deploy tagged "v2.5.0"
 */
export function christeningDelay(event: WallpaperEvent): number {
  return event.meta.tag.trim() === '' ? UNNAMED_DELAY : NAMED_DELAY;
}
