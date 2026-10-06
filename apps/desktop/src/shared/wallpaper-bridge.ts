import type { Rect, Screen } from '@deskorama/core';
import type { Scene } from './scene.ts';
import type { WireEvent } from './wire-event.ts';
import type { WireRecap } from './wire-recap.ts';
import type { WireState } from './wire-state.ts';

/** The IPC channel on which the main process sends a wallpaper page the Events routed to its screen. */
export const EVENT_CHANNEL = 'wallpaper:event';

/** The IPC channel on which the main process sends the recap to the page of the most visible screen. */
export const RECAP_CHANNEL = 'wallpaper:recap';

/** The IPC channel on which the main process sends every page what every screen shares, whenever it changes. */
export const STATE_CHANNEL = 'wallpaper:state';

/** The IPC channel on which the main process sends every page what covers the wallpapers. */
export const FRAMES_CHANNEL = 'wallpaper:frames';

/**
 * The IPC channel on which the main process sends every page the screens, whenever one comes, goes or moves, or
 * its Dock does.
 */
export const SCREENS_CHANNEL = 'wallpaper:screens';

/** The IPC channel on which the main process sends every page the scene, whenever the person changes it. */
export const SCENE_CHANNEL = 'wallpaper:scene';

/**
 * Everything a wallpaper page hears from the main process, exposed by the preload as `window.wallpaper`. It is the
 * whole bridge: pages run with context isolation, a sandbox and no Node, so they reach nothing else. The main
 * process decides which screen plays what; a page plays what it receives.
 */
export interface WallpaperBridge {
  /** Calls `listener` with every Event the main process routes to this screen, until cancelled. */
  onEvent(listener: (event: WireEvent) => void): () => void;
  /** Calls `listener` with the recap of what was missed, when this screen is the one to show it. */
  onRecap(listener: (recap: WireRecap) => void): () => void;
  /** Calls `listener` with the Gauges, today's tally and the recent Events, the same on every screen. */
  onState(listener: (state: WireState) => void): () => void;
  /**
   * Calls `listener` with the frames of everything covering the wallpapers (other windows, menu bars, Docks), in
   * desktop coordinates, whenever they change, until cancelled. A paused wallpaper counts as covered everywhere.
   */
  onWindowFrames(listener: (frames: readonly Rect[]) => void): () => void;
  /** Calls `listener` with every connected screen, left to right, whenever the arrangement changes. */
  onScreens(listener: (screens: readonly Screen[]) => void): () => void;
  /** Calls `listener` with the new scene whenever the Theme, the language or the brand Source changes. */
  onScene(listener: (scene: Scene) => void): () => void;
}
