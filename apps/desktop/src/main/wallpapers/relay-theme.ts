import type { Theme } from '@deskorama/core';
import { toWireEvent } from '../../shared/to-wire-event.ts';
import { toWireRecap } from '../../shared/to-wire-recap.ts';
import { EVENT_CHANNEL, RECAP_CHANNEL, SCREENS_CHANNEL } from '../../shared/wallpaper-bridge.ts';
import type { WallpaperPort } from './wallpaper-port.ts';

/**
 * Returns the Theme the main process mounts on every screen. It draws nothing: it passes what the engine hands its
 * screen (the Events routed there, the recap when that screen shows it, a new arrangement) on to the screen's
 * wallpaper window, whose page plays it with the Theme the person chose. It always listens for recaps, so the
 * engine sends one to the most visible screen whatever the page's Theme draws of it.
 * @example
 * const unmount = engine.mountScreens(relayTheme(), { open: openWindow, close: (_screen, port) => port.close() });
 * engine.send(mergedPullRequest); // one window's page receives it on EVENT_CHANNEL
 */
export function relayTheme(): Theme<WallpaperPort> {
  return {
    name: 'relay',
    mount(port, host) {
      const stops = [
        host.onEvent((event) => port.send(EVENT_CHANNEL, toWireEvent(event))),
        host.onRecap((recap) => port.send(RECAP_CHANNEL, toWireRecap(recap))),
        host.onScreens((screens) => port.send(SCREENS_CHANNEL, screens)),
      ];

      return () => {
        for (const stop of stops) stop();
      };
    },
  };
}
