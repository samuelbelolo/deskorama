import type { Host, Rect, Screen } from '@deskorama/core';
import { createRendererClock } from './create-renderer-clock.ts';

/** The Host of one wallpaper page, which the menu bar can pause. */
export interface RendererHost extends Host {
  /** While paused, the whole screen counts as covered: the scene freezes and no Gag plays. */
  setPaused(paused: boolean): void;
}

/**
 * Returns the Host a wallpaper page plays for its one screen: the page's Clock, the system's reduced-motion
 * setting, and the frames of everything covering the wallpapers as the main process reads them. Until the first
 * frames arrive, the whole wallpaper counts as visible. While paused it reports the screen fully covered, so the
 * engine stops its display frames and keeps the Events for the recap; resuming reports the real frames again.
 * @example
 * const host = createRendererHost(setup.screen);
 * const engine = createEngine(host, { lang: scene.lang, seed: setup.seed, source: scene.source });
 * host.setPaused(true); // the scene freezes
 */
export function createRendererHost(screen: Screen): RendererHost {
  const cover: readonly Rect[] = [{ x: screen.x, y: screen.y, w: screen.width, h: screen.height }];
  const listeners = new Set<(frames: readonly Rect[]) => void>();

  let frames: readonly Rect[] = [];
  let paused = false;

  const covering = (): readonly Rect[] => (paused ? cover : frames);

  const emit = (): void => {
    for (const listener of listeners) listener(covering());
  };

  window.wallpaper.onWindowFrames((next) => {
    frames = next;

    if (!paused) emit();
  });

  return {
    screens: () => [screen],
    clock: createRendererClock(),
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    windowFrames: covering,
    onWindowFrames(listener) {
      listeners.add(listener);

      return () => void listeners.delete(listener);
    },
    setPaused(next) {
      if (next === paused) return;

      paused = next;

      emit();
    },
  };
}
