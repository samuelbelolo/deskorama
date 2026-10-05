import { createListeners, type Host, type Rect } from '@deskorama/core';

/** A Host the menu bar can pause. */
export interface PausableHost extends Host {
  /** While paused, every screen counts as covered: the engine keeps the Events and every scene freezes. */
  setPaused(paused: boolean): void;
}

/**
 * Returns `host` with a pause. While paused it reports a frame over each whole screen instead of the real window
 * frames, so the engine plays nothing and keeps what arrives for the recap; resuming reports the real frames again,
 * and the engine brings back what was missed.
 * @example
 * const host = createPausableHost(displayHost);
 * host.setPaused(true);
 * host.windowFrames(); // one frame per screen, each covering it whole
 */
export function createPausableHost(host: Host): PausableHost {
  const listeners = createListeners<readonly Rect[]>();

  let paused = false;

  const cover = (): readonly Rect[] => host.screens().map(({ x, y, width, height }) => ({ x, y, w: width, h: height }));

  const covering = (): readonly Rect[] => (paused ? cover() : host.windowFrames());

  return {
    screens: () => host.screens(),
    onScreens: (listener) => host.onScreens?.(listener) ?? (() => {}),
    clock: host.clock,
    reducedMotion: host.reducedMotion,
    windowFrames: covering,
    onWindowFrames(listener) {
      const stops = [
        listeners.add(listener),
        // A window that moves during the pause changes nothing: every screen still counts as covered.
        host.onWindowFrames((frames) => {
          if (!paused) listener(frames);
        }),
      ];

      return () => {
        for (const stop of stops) stop();
      };
    },
    setPaused(next) {
      if (next === paused) return;

      paused = next;

      listeners.emit(covering());
    },
  };
}
