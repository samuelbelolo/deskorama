import type { Clock } from '@deskorama/core';

/** The main process has no display: its frames tick at 60 per second, for whoever asks for them. */
const FRAME_MS = 1000 / 60;

/**
 * Returns the real Clock of the main process: wall time and timers. With each renderer's Clock, it is the only
 * place in the app that reads the system time; Connectors and the engine only see a Clock.
 * @example
 * const clock = createNodeClock();
 * clock.after(1000, () => poll());
 */
export function createNodeClock(): Clock {
  return {
    now: () => Date.now(),
    after(ms, task) {
      const timer = setTimeout(task, ms);
      return () => clearTimeout(timer);
    },
    onFrame(listener) {
      const timer = setInterval(() => listener(Date.now()), FRAME_MS);
      return () => clearInterval(timer);
    },
  };
}
