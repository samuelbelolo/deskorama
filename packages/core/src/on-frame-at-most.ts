import type { Cancel, Clock } from './clock.ts';

/**
 * Share of a frame interval a frame may come early and still be drawn. Display frames never land exactly on the
 * cap's interval: a 33.3 ms cap on a 120 Hz screen sees frames at 33.33 ms, on the fake Clock at 32 ms.
 */
const EARLY_TOLERANCE = 0.1;

/**
 * Calls `listener` on the Clock's display frames, at most `fps` times per second, until cancelled. A Theme draws
 * through it so a 120 Hz screen does not redraw the scene 120 times per second. The first frame is always drawn.
 * @example
 * const stop = onFrameAtMost(host.clock, 30, (now) => draw(now)); // 30 draws per second on a 120 Hz screen
 * stop();
 */
export function onFrameAtMost(clock: Clock, fps: number, listener: (now: number) => void): Cancel {
  const interval = 1000 / fps;
  let last = Number.NEGATIVE_INFINITY;
  return clock.onFrame((now) => {
    if (now - last < interval * (1 - EARLY_TOLERANCE)) return;
    last = now;
    listener(now);
  });
}
