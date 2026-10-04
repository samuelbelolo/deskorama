import type { Cancel, Clock } from './clock.ts';
import type { Rect } from './rect.ts';
import type { Screen } from './screen.ts';

/**
 * What the platform provides to the engine: the desktop app's main process, or the demo's fake desktop.
 * Cursor storage comes later.
 */
export interface Host {
  /** The connected screens, left to right. */
  screens(): readonly Screen[];
  /**
   * Calls `listener` with the new screens whenever one is plugged in, unplugged, resized or moved, until cancelled.
   * A platform whose screens never change (a page that draws a single screen) leaves it out.
   */
  onScreens?(listener: (screens: readonly Screen[]) => void): Cancel;
  readonly clock: Clock;
  /** True when the person asked the system to reduce motion. */
  readonly reducedMotion: boolean;
  /**
   * Everything that covers the wallpaper, in desktop coordinates (the same as {@link Screen.x}): other apps'
   * windows, the menu bar and the Dock.
   */
  windowFrames(): readonly Rect[];
  /** Calls `listener` with the new frames whenever a window moves, opens or closes, until cancelled. */
  onWindowFrames(listener: (frames: readonly Rect[]) => void): Cancel;
}
