import type { Host } from '../src/host.ts';
import type { Rect } from '../src/rect.ts';
import type { Screen } from '../src/screen.ts';

/** A MacBook screen at the origin of the desktop. */
export const BUILTIN: Screen = { id: 'builtin', x: 0, y: 0, width: 1440, height: 900 };

/** A 16:9 screen right of the MacBook. */
export const EXTERNAL: Screen = { id: 'external', x: 1440, y: 0, width: 1600, height: 900 };

/** A Host a test drives by hand. Core cannot use test-utils (test-utils depends on core), so it has its own. */
export interface ManualHost extends Host {
  /** Moves time forward by `ms`, firing the timers due on the way, in time order. */
  advance(ms: number): void;
  /** Fires one display frame at the current time. */
  frame(): void;
  /** How many frame subscriptions the platform Clock has right now. */
  frameSubscriptions(): number;
  /** Moves the windows: every follower hears the new frames. */
  setWindowFrames(frames: readonly Rect[]): void;
  /** How many subscriptions to the window frames are open right now. */
  frameFollowers(): number;
  /** Plugs, unplugs, resizes or moves screens: every follower hears the new arrangement. */
  setScreens(screens: readonly Screen[]): void;
  /** How many subscriptions to the screens are open right now. */
  screenFollowers(): number;
}

/** 4 October 2026, 14:00 UTC: when every manual Host starts unless told otherwise. */
export const START: number = Date.UTC(2026, 9, 4, 14);

/**
 * Returns a Host whose time, frames and windows only change when the test says so.
 * @example
 * const host = createManualHost({ start: Date.UTC(2026, 9, 4, 14) });
 * host.setWindowFrames([{ x: 0, y: 0, w: 1440, h: 900 }]);
 * host.advance(1000);
 * host.clock.now(); // Date.UTC(2026, 9, 4, 14) + 1000
 */
export function createManualHost(options: { start?: number; screens?: readonly Screen[] } = {}): ManualHost {
  let now = options.start ?? START;
  let frames: readonly Rect[] = [];
  let screens: readonly Screen[] = options.screens ?? [BUILTIN];
  let timers: { due: number; task: () => void }[] = [];

  const frameListeners = new Set<(now: number) => void>();
  const followers = new Set<(frames: readonly Rect[]) => void>();
  const screenFollowers = new Set<(screens: readonly Screen[]) => void>();

  return {
    screens: () => screens,
    onScreens(listener) {
      const entry = (next: readonly Screen[]): void => listener(next);
      screenFollowers.add(entry);
      return () => void screenFollowers.delete(entry);
    },
    reducedMotion: false,
    clock: {
      now: () => now,
      after(ms, task) {
        const timer = { due: now + ms, task };
        timers.push(timer);
        return () => {
          timers = timers.filter((other) => other !== timer);
        };
      },
      onFrame(listener) {
        const entry = (at: number): void => listener(at);
        frameListeners.add(entry);
        return () => void frameListeners.delete(entry);
      },
    },
    windowFrames: () => frames,
    onWindowFrames(listener) {
      const entry = (next: readonly Rect[]): void => listener(next);
      followers.add(entry);
      return () => void followers.delete(entry);
    },
    advance(ms) {
      const target = now + ms;
      for (;;) {
        const due = timers.filter((timer) => timer.due <= target).toSorted((a, b) => a.due - b.due)[0];
        if (due === undefined) break;
        timers = timers.filter((timer) => timer !== due);
        now = due.due;
        due.task();
      }
      now = target;
    },
    frame() {
      for (const listener of Array.from(frameListeners)) listener(now);
    },
    frameSubscriptions: () => frameListeners.size,
    setWindowFrames(next) {
      frames = next;
      for (const follower of Array.from(followers)) follower(next);
    },
    frameFollowers: () => followers.size,
    setScreens(next) {
      screens = next;
      for (const follower of Array.from(screenFollowers)) follower(next);
    },
    screenFollowers: () => screenFollowers.size,
  };
}
