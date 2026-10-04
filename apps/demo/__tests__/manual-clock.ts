import type { Clock } from '@deskorama/core';

/** A Clock a test moves by hand. */
export interface ManualClock extends Clock {
  /** Moves time on by `ms`, running every timer that falls due, in order. */
  advance(ms: number): void;
}

/**
 * Returns a Clock that stands still at `start` until the test advances it; its timers run as time passes them, and it
 * draws no frame.
 * @example
 * const clock = createManualClock(new Date(2026, 9, 4, 14).getTime());
 * clock.after(1000, () => console.log('due'));
 * clock.advance(1000); // logs "due"
 */
export function createManualClock(start: number): ManualClock {
  let now = start;
  let timers: { at: number; task: () => void }[] = [];

  return {
    now: () => now,
    after(ms, task) {
      const timer = { at: now + ms, task };
      timers.push(timer);

      return () => {
        timers = timers.filter((each) => each !== timer);
      };
    },
    onFrame: () => () => {},
    advance(ms) {
      const end = now + ms;

      for (;;) {
        const next = timers.filter((each) => each.at <= end).toSorted((a, b) => a.at - b.at)[0];
        if (next === undefined) break;

        timers = timers.filter((each) => each !== next);
        now = next.at;
        next.task();
      }

      now = end;
    },
  };
}
