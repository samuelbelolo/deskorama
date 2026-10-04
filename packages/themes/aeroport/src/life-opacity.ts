import { keyframe } from './keyframe.ts';

/** How long a Gag's actors take to appear, and to go. */
const FADE_IN_MS = 200;
const FADE_OUT_MS = 300;

/**
 * Returns an actor's opacity `elapsed` ms into its life of `duration` ms: it fades in, holds, then fades out at
 * the end, so nothing pops.
 * @example
 * lifeOpacity(100, 4000); // 0.5
 * lifeOpacity(2000, 4000); // 1
 */
export function lifeOpacity(elapsed: number, duration: number): number {
  return keyframe(elapsed, [
    [0, 0],
    [FADE_IN_MS, 1],
    [duration - FADE_OUT_MS, 1],
    [duration, 0],
  ]);
}
