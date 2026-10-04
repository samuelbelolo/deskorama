import type { Rect } from '@deskorama/core';
import type { WireEvent } from './wire-event.ts';

/** The IPC channel on which the main process sends a renderer its Events. */
export const EVENT_CHANNEL = 'wallpaper:event';

/** The IPC channel on which the main process sends every renderer what covers the wallpapers. */
export const FRAMES_CHANNEL = 'wallpaper:frames';

/**
 * Everything a renderer may ask of the main process, exposed by the preload as `window.wallpaper`. It is the whole
 * bridge: renderers run with context isolation, a sandbox and no Node, so they reach nothing else.
 */
export interface WallpaperBridge {
  /** Calls `listener` with every Event the main process routes to this screen, until cancelled. */
  onEvent(listener: (event: WireEvent) => void): () => void;
  /**
   * Calls `listener` with the frames of everything covering the wallpapers (other windows, menu bars, Docks), in
   * desktop coordinates, whenever they change, until cancelled.
   */
  onWindowFrames(listener: (frames: readonly Rect[]) => void): () => void;
}
