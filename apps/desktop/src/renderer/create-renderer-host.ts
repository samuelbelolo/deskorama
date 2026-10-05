import { createListeners, type Host, type Rect, type Screen } from '@deskorama/core';
import { createRendererClock } from './create-renderer-clock.ts';

/**
 * Returns the Host of a wallpaper page: the page's Clock, the system's reduced-motion setting, and the screens and
 * the frames of everything covering the wallpapers as the main process reports them. The page opens on `screens`;
 * until the first frames arrive, the whole wallpaper counts as visible. A paused wallpaper arrives as frames
 * covering every screen, so the scene freezes by itself.
 * @example
 * const host = createRendererHost(setup.screens);
 * const player = createScreenPlayer(host, { screen: setup.screen, lang: 'fr', seed: setup.seed, source });
 */
export function createRendererHost(screens: readonly Screen[]): Host {
  const frameListeners = createListeners<readonly Rect[]>();
  const screenListeners = createListeners<readonly Screen[]>();

  let frames: readonly Rect[] = [];
  let connected = screens;

  window.wallpaper.onWindowFrames((next) => {
    frames = next;
    frameListeners.emit(next);
  });

  window.wallpaper.onScreens((next) => {
    connected = next;
    screenListeners.emit(next);
  });

  return {
    screens: () => connected,
    onScreens: screenListeners.add,
    clock: createRendererClock(),
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    windowFrames: () => frames,
    onWindowFrames: frameListeners.add,
  };
}
