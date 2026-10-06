import type { Screen, ScreenLayers } from '@deskorama/core';
import type { WallpaperPort } from './wallpaper-port.ts';

/** The wallpaper windows open right now: one per screen the engine is mounted on. */
export interface WallpaperWindows {
  /**
   * How an engine gets a window per screen: one opens for a screen that arrives, and closes when its screen
   * leaves, moves or changes size. `greet` is called with each window as the engine takes it.
   */
  layers(greet: (port: WallpaperPort) => void): ScreenLayers<WallpaperPort>;
  /** Sends one message to the page of every window. */
  broadcast(channel: string, payload: unknown): void;
  /** Unmounts one engine with `stop` and mounts another with `start`, which takes over the windows left open. */
  handOver(stop: () => void, start: () => void): void;
}

/**
 * Returns the wallpaper windows, none open yet: the engine opens and closes them as it follows the screens.
 * @example
 * const windows = createWallpaperWindows((screen) => openWallpaperWindow({ screen, screens, scene, seed }, host));
 * const unmount = engine.mountScreens(relayTheme(), windows.layers((port) => port.send(STATE_CHANNEL, state)));
 * windows.broadcast(FRAMES_CHANNEL, frames); // every page hears the frames
 */
export function createWallpaperWindows(open: (screen: Screen) => WallpaperPort): WallpaperWindows {
  const ports = new Set<WallpaperPort>();

  // The windows one engine leaves to the next, by screen id.
  const left = new Map<string, WallpaperPort>();

  let handingOver = false;

  return {
    layers: (greet) => ({
      open(screen) {
        const port = left.get(screen.id) ?? open(screen);

        left.delete(screen.id);
        ports.add(port);

        greet(port);

        return port;
      },
      close(screen, port) {
        ports.delete(port);

        if (handingOver) left.set(screen.id, port);
        else port.close();
      },
    }),

    broadcast(channel, payload) {
      for (const port of ports) port.send(channel, payload);
    },

    handOver(stop, start) {
      handingOver = true;
      stop();
      handingOver = false;

      start();

      // A window the new engine did not take has no screen any more.
      for (const port of left.values()) port.close();

      left.clear();
    },
  };
}
