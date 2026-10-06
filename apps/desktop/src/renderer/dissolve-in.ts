import type { Host } from '@deskorama/core';

/** How long a scene takes to appear over the one it replaces. */
const DISSOLVE_MS = 600;

/**
 * Fades `frame` in over what lies under it, then calls `done`, which takes the old scene away: a scene laid out
 * again dissolves into place rather than jumping. With reduced motion, `done` is called at once.
 * @example
 * dissolveIn(opened.frame, host, closePrevious); // the previous scene leaves 600 ms later, fully covered
 */
export function dissolveIn(frame: HTMLElement, host: Pick<Host, 'clock' | 'reducedMotion'>, done: () => void): void {
  if (host.reducedMotion) {
    done();

    return;
  }

  frame.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DISSOLVE_MS, easing: 'ease-in-out' });

  // A timer rather than the animation's end: a covered window may hold its animations back, never its timers.
  host.clock.after(DISSOLVE_MS, done);
}
