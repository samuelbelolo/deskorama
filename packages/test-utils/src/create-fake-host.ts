import { createListeners, type Host, type Rect, type Screen } from '@deskorama/core';
import { createFakeClock, type FakeClock } from './create-fake-clock.ts';
import { FAKE_SCREEN } from './fake-screen.ts';

/** A Host whose Clock, windows and screens a test moves by hand. */
export interface FakeHost extends Host {
  readonly clock: FakeClock;
  /** Moves the windows, in desktop coordinates: every follower hears the new frames. */
  setWindowFrames(frames: readonly Rect[]): void;
  /** Plugs, unplugs, resizes or moves screens: every follower hears the new arrangement. */
  setScreens(screens: readonly Screen[]): void;
}

/** How a fake Host is set up; every field has a default. */
export interface FakeHostOptions {
  readonly screens?: readonly Screen[];
  readonly start?: number;
  readonly reducedMotion?: boolean;
}

/**
 * Returns a platform Host for engine tests: one MacBook screen, no window, and a fake Clock, unless told otherwise.
 * @example
 * const host = createFakeHost();
 * host.setScreens([FAKE_SCREEN, { id: 'external', x: 1440, y: 0, width: 1600, height: 900 }]);
 * host.screens().length; // 2
 */
export function createFakeHost(options: FakeHostOptions = {}): FakeHost {
  const frameListeners = createListeners<readonly Rect[]>();
  const screenListeners = createListeners<readonly Screen[]>();

  let screens = options.screens ?? [FAKE_SCREEN];
  let frames: readonly Rect[] = [];

  return {
    screens: () => screens,
    onScreens: screenListeners.add,
    clock: createFakeClock(options.start ?? 0),
    reducedMotion: options.reducedMotion ?? false,
    windowFrames: () => frames,
    onWindowFrames: frameListeners.add,
    setWindowFrames(next) {
      frames = next;
      frameListeners.emit(next);
    },
    setScreens(next) {
      screens = next;
      screenListeners.emit(next);
    },
  };
}
