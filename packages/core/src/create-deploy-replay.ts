import type { Cancel, Clock } from './clock.ts';
import type { WallpaperEvent } from './wallpaper-event.ts';

/** How long the recap holds the screen before a missed deploy step plays: the time to read it. */
export const RECAP_HOLD_MS = 8000;

/** The deploy step the scene still owes after a recap, played once the recap has been read. */
export interface DeployReplay {
  /** Owes `event` and plays it after the recap hold, unless the wallpaper hides or a newer step comes first. */
  schedule(event: WallpaperEvent): void;
  /** Stops the countdown but keeps the step owed: the wallpaper hid again before it played. */
  pause(): void;
  /** Returns the step still owed and forgets it; null when none is. */
  take(): WallpaperEvent | null;
  /** Forgets the step owed: a newer deploy step supersedes it, or no screen is left to show it. */
  drop(): void;
}

/**
 * Returns the holder of the deploy step a recap owes. A wallpaper hidden again while the recap is read keeps the step
 * owed, so it plays at the next return instead of being lost.
 * @example
 * const deploys = createDeployReplay(clock, (event) => deliverEverywhere(event));
 * deploys.schedule(deployFailed); // plays 8 s later
 * deploys.pause(); // hidden again: nothing plays
 * deploys.take(); // deployFailed, to play at the return
 */
export function createDeployReplay(clock: Clock, play: (event: WallpaperEvent) => void): DeployReplay {
  let owed: WallpaperEvent | null = null;
  let stop: Cancel | null = null;

  /** Stops the countdown, if any, and keeps the step owed. */
  const pause = (): void => {
    stop?.();
    stop = null;
  };

  return {
    schedule(event) {
      pause();
      owed = event;

      stop = clock.after(RECAP_HOLD_MS, () => {
        stop = null;
        owed = null;
        play(event);
      });
    },

    pause,

    take() {
      pause();

      const event = owed;
      owed = null;

      return event;
    },

    drop() {
      pause();
      owed = null;
    },
  };
}
