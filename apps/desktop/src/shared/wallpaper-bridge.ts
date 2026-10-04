import type { GaugeValues, Rect } from '@deskorama/core';
import type { Scene } from './scene.ts';
import type { WireEvent } from './wire-event.ts';

/** The IPC channel on which the main process sends a renderer its Events. */
export const EVENT_CHANNEL = 'wallpaper:event';

/** The IPC channel on which the main process sends every renderer what covers the wallpapers. */
export const FRAMES_CHANNEL = 'wallpaper:frames';

/** The IPC channel on which the main process sends every renderer the scene, whenever the person changes it. */
export const SCENE_CHANNEL = 'wallpaper:scene';

/** The IPC channel on which the main process sends every renderer the Gauge values of the Sources that feed them. */
export const GAUGES_CHANNEL = 'wallpaper:gauges';

/** The IPC channel on which the main process tells every renderer the wallpaper is paused, or not any more. */
export const PAUSED_CHANNEL = 'wallpaper:paused';

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
  /** Calls `listener` with the new scene whenever the Theme, the language or the brand Source changes. */
  onScene(listener: (scene: Scene) => void): () => void;
  /** Calls `listener` with the Gauge values the Sources report; roles left out keep their value. */
  onGauges(listener: (values: Partial<GaugeValues>) => void): () => void;
  /** Calls `listener` with true when the person pauses the wallpaper from the menu bar, false when it resumes. */
  onPaused(listener: (paused: boolean) => void): () => void;
}
