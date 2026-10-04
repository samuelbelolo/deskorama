import type { Clock } from '@deskorama/core';

/**
 * Returns the real Clock of a browser page: wall time, timers and display frames. It is the only place in the demo
 * that reads the system time; the engine and the Themes only see the Clock.
 * @example
 * const clock = createBrowserClock();
 * clock.after(1000, () => console.log('one second later'));
 */
export function createBrowserClock(): Clock {
  return {
    now: () => Date.now(),
    after(ms, task) {
      const timer = window.setTimeout(task, ms);
      return () => window.clearTimeout(timer);
    },
    onFrame(listener) {
      let frame = window.requestAnimationFrame(function tick() {
        listener(Date.now());
        frame = window.requestAnimationFrame(tick);
      });
      return () => window.cancelAnimationFrame(frame);
    },
  };
}
