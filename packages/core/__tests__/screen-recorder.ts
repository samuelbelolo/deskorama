import type { Recap } from '../src/recap.ts';
import type { Screen } from '../src/screen.ts';
import type { ScreenHost } from '../src/screen-host.ts';
import type { ScreenLayers } from '../src/screen-layers.ts';
import type { Theme } from '../src/theme.ts';
import type { WallpaperEvent } from '../src/wallpaper-event.ts';

/** What one Theme instance saw on one screen. */
interface ScreenRecording {
  readonly host: ScreenHost;
  readonly layer: string;
  readonly events: WallpaperEvent[];
  readonly recaps: Recap[];
  unmounted: boolean;
}

/** A Theme that records every instance, and the layers the engine opened and closed for it. */
export interface ScreenRecorder {
  readonly theme: Theme<string>;
  readonly layers: ScreenLayers<string>;
  /** Every instance ever mounted, in mount order. */
  readonly instances: ScreenRecording[];
  /** The layers opened and closed, as "open builtin" or "close external". */
  readonly log: string[];
  /** The instance still mounted on the screen with this id; throws when there is none. */
  on(id: string): ScreenRecording;
}

/**
 * Returns a Theme that draws nothing, records what each of its instances receives, and layers named after their
 * screen. With `recaps: false` the Theme never listens for recaps, like one that draws none.
 * @example
 * const recorder = screenRecorder();
 * engine.mountScreens(recorder.theme, recorder.layers);
 * recorder.on('external').events; // every Event routed to the external screen
 */
export function screenRecorder(options: { recaps?: boolean } = {}): ScreenRecorder {
  const instances: ScreenRecording[] = [];
  const log: string[] = [];

  const theme: Theme<string> = {
    name: 'recording',
    mount(layer, host) {
      const recording: ScreenRecording = { host, layer, events: [], recaps: [], unmounted: false };
      instances.push(recording);
      host.onEvent((event) => recording.events.push(event));
      if (options.recaps !== false) host.onRecap((recap) => recording.recaps.push(recap));
      return () => {
        recording.unmounted = true;
      };
    },
  };

  const layers: ScreenLayers<string> = {
    open(screen: Screen) {
      log.push(`open ${screen.id}`);
      return `layer of ${screen.id} at ${screen.width}x${screen.height}`;
    },
    close(screen: Screen) {
      log.push(`close ${screen.id}`);
    },
  };

  return {
    theme,
    layers,
    instances,
    log,
    on(id) {
      const found = instances.findLast((each) => each.host.screen.id === id && !each.unmounted);
      if (found === undefined) throw new Error(`No instance is mounted on ${id}.`);
      return found;
    },
  };
}
