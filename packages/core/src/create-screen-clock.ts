import type { Cancel, Clock } from './clock.ts';

/** The Clock a Theme gets for one screen: display frames stop while the screen is hidden. */
export interface ScreenClock extends Clock {
  /** Stops frames while hidden and resumes them when visible again; timers keep running either way. */
  setHidden(hidden: boolean): void;
  /** Cancels every frame subscription and timer the Theme left behind. */
  dispose(): void;
}

/**
 * Returns a screen's Clock over the platform's. While the screen is hidden it unsubscribes from the platform's
 * frames, so a covered scene costs nothing; timers still fire, so a Gag that was playing still ends.
 * @example
 * const clock = createScreenClock(host.clock);
 * clock.onFrame(draw);
 * clock.setHidden(true); // draw is no longer called
 * clock.setHidden(false); // draw is called again on every frame
 */
export function createScreenClock(clock: Clock): ScreenClock {
  const frameListeners = new Set<(now: number) => void>();
  const timers = new Set<Cancel>();
  let hidden = false;
  let stopFrames: Cancel | null = null;
  const sync = (): void => {
    const wanted = !hidden && frameListeners.size > 0;
    if (wanted && stopFrames === null) {
      stopFrames = clock.onFrame((now) => {
        for (const listener of Array.from(frameListeners)) listener(now);
      });
    } else if (!wanted && stopFrames !== null) {
      stopFrames();
      stopFrames = null;
    }
  };
  return {
    now: () => clock.now(),
    after(ms, task) {
      const cancel = clock.after(ms, () => {
        timers.delete(cancel);
        task();
      });
      timers.add(cancel);
      return () => {
        timers.delete(cancel);
        cancel();
      };
    },
    onFrame(listener) {
      const entry = (now: number): void => listener(now);
      frameListeners.add(entry);
      sync();
      return () => {
        frameListeners.delete(entry);
        sync();
      };
    },
    setHidden(next) {
      hidden = next;
      sync();
    },
    dispose() {
      for (const cancel of timers) cancel();
      timers.clear();
      frameListeners.clear();
      sync();
    },
  };
}
