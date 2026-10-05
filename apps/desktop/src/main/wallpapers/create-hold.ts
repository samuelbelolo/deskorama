/** What arrives while the wallpaper is paused, kept until the pause ends. */
export interface Hold {
  /** Applies `apply` now, or once released when holding. */
  whenFree(apply: () => void): void;
  /** Starts keeping what arrives. */
  hold(): void;
  /** Applies what was kept, in the order it arrived, and keeps nothing more. */
  release(): void;
}

/**
 * Returns a hold that keeps nothing yet. While paused, nothing on screen may change, not even a sign: the Events
 * and Gauge values that arrive wait here.
 * @example
 * const held = createHold();
 * held.hold();
 * held.whenFree(() => engine.send(event)); // kept
 * held.release(); // the engine receives the Event
 */
export function createHold(): Hold {
  let holding = false;
  let kept: (() => void)[] = [];

  return {
    whenFree(apply) {
      if (holding) kept.push(apply);
      else apply();
    },
    hold() {
      holding = true;
    },
    release() {
      const waiting = kept;

      holding = false;
      kept = [];

      for (const apply of waiting) apply();
    },
  };
}
