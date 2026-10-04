import type { Clock } from '@deskorama/core';

/** The time between two display frames of the fake Clock: 60 frames per second, rounded. */
export const FRAME_MS = 16;

/** A Clock that only moves when a test steps it. */
export interface FakeClock extends Clock {
  /** Moves time forward by `ms`, firing every frame and timer due on the way, in time order. */
  advance(ms: number): void;
}

interface Timer {
  readonly due: number;
  readonly order: number;
  readonly task: () => void;
}

/**
 * Returns a Clock that stands still until `advance` is called. Frames fire every {@link FRAME_MS}
 * milliseconds and timers at their due time, in time order, so a test can jump straight to any instant.
 * @example
 * const clock = createFakeClock(Date.UTC(2026, 9, 4, 14));
 * clock.after(2500, () => console.log('caption gone'));
 * clock.advance(3000); // logs "caption gone"
 */
export function createFakeClock(start = 0): FakeClock {
  let now = start;
  let nextFrame = start + FRAME_MS;
  let order = 0;
  const timers = new Set<Timer>();
  const frames = new Set<(now: number) => void>();
  return {
    now: () => now,
    after(ms, task) {
      const timer = { due: now + Math.max(0, ms), order: order++, task };
      timers.add(timer);
      return () => void timers.delete(timer);
    },
    onFrame(listener) {
      frames.add(listener);
      return () => void frames.delete(listener);
    },
    advance(ms) {
      const target = now + ms;
      for (;;) {
        const timer = firstDue(timers, target);
        if (nextFrame <= target && (timer === undefined || nextFrame <= timer.due)) {
          now = nextFrame;
          nextFrame += FRAME_MS;
          // A snapshot, so a listener that subscribes another during this frame does not call it twice.
          for (const listener of Array.from(frames)) listener(now);
        } else if (timer !== undefined) {
          now = timer.due;
          timers.delete(timer);
          timer.task();
        } else break;
      }
      now = target;
    },
  };
}

/**
 * Returns the timer that fires first among those due by `target`, or undefined when none is.
 * @example
 * firstDue(new Set([{ due: 30, order: 1, task }, { due: 10, order: 2, task }]), 50); // the one due at 10
 */
function firstDue(timers: ReadonlySet<Timer>, target: number): Timer | undefined {
  let first: Timer | undefined;
  for (const timer of timers) {
    if (timer.due > target) continue;
    if (first === undefined || timer.due < first.due || (timer.due === first.due && timer.order < first.order)) {
      first = timer;
    }
  }
  return first;
}
