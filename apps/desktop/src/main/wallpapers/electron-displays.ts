import { screen } from 'electron';
import type { DisplaySource } from './display-source.ts';

/**
 * Returns the Mac's displays as Electron reports them. Call it once the app is ready: Electron's `screen` cannot
 * be read before.
 * @example
 * const displays = electronDisplays();
 * displays.onChange(() => console.log(displays.all().length)); // logs 2 when an external screen is plugged in
 */
export function electronDisplays(): DisplaySource {
  return {
    all: () => screen.getAllDisplays(),
    onChange(listener) {
      // The listener ignores which display the event names and reads them all again.
      const heard = (): void => listener();

      screen.on('display-added', heard);
      screen.on('display-removed', heard);
      screen.on('display-metrics-changed', heard);

      return () => {
        screen.off('display-added', heard);
        screen.off('display-removed', heard);
        screen.off('display-metrics-changed', heard);
      };
    },
  };
}
