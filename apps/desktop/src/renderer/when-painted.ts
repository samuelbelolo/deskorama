import type { Clock } from '@deskorama/core';

/** How long to wait for the display's frames at most: a covered window may be given none. */
const PAINT_TIMEOUT_MS = 250;

/**
 * Calls `done` once what was just drawn has reached the screen: after two display frames, or after a quarter of a
 * second when the display gives none.
 * @example
 * whenPainted(host.clock, () => window.wallpaper.drawn()); // the window may show: its scene is on it
 */
export function whenPainted(clock: Clock, done: () => void): void {
  let frames = 0;
  let finished = false;

  /** Stops waiting and says the scene is on screen, once. */
  const finish = (): void => {
    if (finished) return;

    finished = true;
    stopFrames();
    stopTimer();
    done();
  };

  const stopFrames = clock.onFrame(() => {
    frames += 1;

    if (frames === 2) finish();
  });

  const stopTimer = clock.after(PAINT_TIMEOUT_MS, finish);
}
