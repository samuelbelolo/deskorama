import type { Host, Rect, Screen } from '@deskorama/core';
import { createRendererClock } from './create-renderer-clock.ts';

/**
 * Returns the Host a wallpaper page plays for its one screen: the page's Clock, the system's reduced-motion
 * setting, and the frames of everything covering the wallpapers as the main process reads them. Until the first
 * frames arrive, the whole wallpaper counts as visible.
 * @example
 * const engine = createEngine(createRendererHost(setup.screen), { lang: setup.lang, seed: setup.seed, source });
 */
export function createRendererHost(screen: Screen): Host {
  let frames: readonly Rect[] = [];
  const listeners = new Set<(frames: readonly Rect[]) => void>();

  window.wallpaper.onWindowFrames((next) => {
    frames = next;

    for (const listener of listeners) listener(frames);
  });

  return {
    screens: () => [screen],
    clock: createRendererClock(),
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    windowFrames: () => frames,
    onWindowFrames(listener) {
      listeners.add(listener);

      return () => void listeners.delete(listener);
    },
  };
}
