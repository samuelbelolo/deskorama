import type { Clock } from '@deskorama/core';

/**
 * Returns the real Clock of a wallpaper page: wall time, timers and display frames. With the main process's Clock,
 * it is the only place in the app that reads the system time; the engine and the Theme only see a Clock. Frames
 * run only while someone listens, so an idle scene asks the display for nothing.
 * @example
 * const clock = createRendererClock();
 * const stop = clock.onFrame((now) => draw(now));
 */
export function createRendererClock(): Clock {
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
