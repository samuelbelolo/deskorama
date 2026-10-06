import { createListeners, type Cancel, type Clock, type Host, type Rect, type Screen } from '@deskorama/core';
import { screenOfDisplay } from '../screen-of-display.ts';
import type { DisplaySource } from './display-source.ts';

/** The Host of the main process, with the way to tell it what covers the wallpapers and to let go of the displays. */
export interface DisplayHost extends Host {
  /**
   * Calls `listener` with the screens whenever a display comes, goes, moves or changes size, or the Dock along its
   * bottom edge does, until cancelled.
   */
  onScreens(listener: (screens: readonly Screen[]) => void): Cancel;
  /** Reports the frames of everything covering the wallpapers, in desktop coordinates. */
  setWindowFrames(frames: readonly Rect[]): void;
  /** Stops following the displays. */
  stop(): void;
}

/** What the main process's Host is made of. */
export interface DisplayHostOptions {
  readonly displays: DisplaySource;
  readonly clock: Clock;
  /** True when the person asked the system to reduce motion. */
  readonly reducedMotion: boolean;
}

/**
 * Returns the Host the main process runs the engine on: the Mac's displays as screens, left to right, read again
 * whenever one is plugged in, unplugged, moved or resized, and the window frames the frame watch reports. Its
 * followers only hear of the screens when one came, went, moved or changed size, or when the Dock along a bottom
 * edge came, went or changed height, since a Theme stands its ground above it: a menu bar that grows changes none.
 * @example
 * const host = createDisplayHost({ displays: electronDisplays(), clock, reducedMotion: false });
 * host.onScreens((screens) => console.log(screens.length)); // logs 1 when the external screen is unplugged
 */
export function createDisplayHost(options: DisplayHostOptions): DisplayHost {
  const screenListeners = createListeners<readonly Screen[]>();
  const frameListeners = createListeners<readonly Rect[]>();

  const read = (): readonly Screen[] =>
    options.displays
      .all()
      .map(screenOfDisplay)
      .toSorted((a, b) => a.x - b.x || a.y - b.y);

  let screens = read();
  let frames: readonly Rect[] = [];

  const stop: Cancel = options.displays.onChange(() => {
    const next = read();

    if (JSON.stringify(next) === JSON.stringify(screens)) return;

    screens = next;
    screenListeners.emit(next);
  });

  return {
    screens: () => screens,
    onScreens: screenListeners.add,
    clock: options.clock,
    reducedMotion: options.reducedMotion,
    windowFrames: () => frames,
    onWindowFrames: frameListeners.add,
    setWindowFrames(next) {
      frames = next;
      frameListeners.emit(next);
    },
    stop,
  };
}
