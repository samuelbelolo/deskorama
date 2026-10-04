import type { ScreenHost } from '../src/screen-host.ts';
import type { Theme } from '../src/theme.ts';
import type { WallpaperEvent } from '../src/wallpaper-event.ts';

/** What a recording Theme saw: the host it was mounted with, its layer and every Event. */
export interface Recording {
  host: ScreenHost | null;
  layer: string | null;
  events: WallpaperEvent[];
  unmounted: boolean;
}

/**
 * Returns a Theme that draws nothing and records what the engine hands it.
 * @example
 * const { theme, recording } = recordingTheme();
 * engine.mount(theme, 'layer');
 * recording.events; // every Event the engine forwarded
 */
export function recordingTheme(): { theme: Theme<string>; recording: Recording } {
  const recording: Recording = { host: null, layer: null, events: [], unmounted: false };
  const theme: Theme<string> = {
    name: 'recording',
    mount(layer, screenHost) {
      recording.host = screenHost;
      recording.layer = layer;
      screenHost.onEvent((event) => recording.events.push(event));
      return () => {
        recording.unmounted = true;
      };
    },
  };
  return { theme, recording };
}

/**
 * Returns the host a recording Theme was mounted with; throws when it was never mounted.
 * @example
 * const host = mountedHost(recording);
 * host.gauges().daily; // 0
 */
export function mountedHost(recording: Recording): ScreenHost {
  if (recording.host === null) throw new Error('The recording Theme was never mounted.');
  return recording.host;
}
