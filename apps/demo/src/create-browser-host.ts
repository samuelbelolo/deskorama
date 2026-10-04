import { createListeners, type Clock, type Host, type Rect, type Screen } from '@deskorama/core';

/** The Host the demo plays, with the fake desktop's way of reporting its screens and where its windows are. */
export interface BrowserHost extends Host {
  /** Reports the frames of every fake screen's menu bar, Dock and windows, in desktop coordinates. */
  setWindowFrames(frames: readonly Rect[]): void;
  /** Plugs or unplugs fake screens; the engine mounts or unmounts their Theme instances. */
  setScreens(screens: readonly Screen[]): void;
}

/**
 * Returns the Host the demo plays: the fake screens, the demo's Clock, the visitor's reduced-motion setting, and the
 * window frames the fake desktops report.
 * @example
 * const host = createBrowserHost([BUILTIN_SCREEN], demoClock.clock);
 * host.setScreens([BUILTIN_SCREEN, EXTERNAL_SCREEN]); // an engine mounted on every screen adds the second one
 * host.screens().length; // 2
 */
export function createBrowserHost(initial: readonly Screen[], clock: Clock): BrowserHost {
  const frameListeners = createListeners<readonly Rect[]>();
  const screenListeners = createListeners<readonly Screen[]>();

  let screens = initial;
  let frames: readonly Rect[] = [];

  return {
    screens: () => screens,
    onScreens: screenListeners.add,
    clock,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
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
