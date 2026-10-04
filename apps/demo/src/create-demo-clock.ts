import type { Clock } from '@deskorama/core';

/** The demo's Clock, which runs at real speed from a time of day the visitor picks. */
export interface DemoClock {
  readonly clock: Clock;
  /** Moves the Clock to this hour of its current day, from where it keeps running. */
  setHour(hour: number): void;
}

/**
 * Returns the demo's Clock: `real` shifted to another hour of the day. Only the time it reads moves; timers and
 * frames keep the real pace, so a Gag lasts as long at 3 a.m. as at 2 p.m. and its Caption stays up its full time.
 * Shift the hour between two sessions, never under a mounted Theme: a running Gag would jump.
 * @example
 * const demo = createDemoClock(createBrowserClock());
 * demo.setHour(22);
 * new Date(demo.clock.now()).getHours(); // 22
 */
export function createDemoClock(real: Clock): DemoClock {
  let shift = 0;

  return {
    clock: {
      now: () => real.now() + shift,
      after: (ms, task) => real.after(ms, task),
      onFrame: (listener) => real.onFrame((now) => listener(now + shift)),
    },
    setHour(hour) {
      const target = new Date(real.now() + shift);
      target.setHours(hour, 0, 0, 0);
      shift = target.getTime() - real.now();
    },
  };
}
