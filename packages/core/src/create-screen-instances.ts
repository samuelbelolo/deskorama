import { clearHeight } from './clear-height.ts';
import type { Cancel } from './clock.ts';
import type { ScreenView } from './create-screen-view.ts';
import { sameGeometry } from './same-geometry.ts';
import type { Screen } from './screen.ts';
import type { ScreenLayers } from './screen-layers.ts';
import type { Theme } from './theme.ts';

/** The Theme instances of one mount, one per connected screen. */
export interface ScreenInstances {
  /**
   * Mounts an instance on every new screen, unmounts the instances of screens that left or changed place or size,
   * and mounts again, on its own layer, the instance of a screen whose Dock moved the line its ground ends on.
   */
  sync(screens: readonly Screen[]): void;
  /** Unmounts every instance. */
  clear(): void;
}

/** How the engine opens and closes the view of one screen. */
export interface ViewLifecycle {
  /** Returns a new view of `screen`, already routed to. */
  open(screen: Screen): ScreenView;
  /** Stops routing to `view` and forgets what its Theme left behind. */
  close(view: ScreenView): void;
}

/** One Theme instance on one screen. */
interface Instance<Layer> {
  readonly screen: Screen;
  readonly layer: Layer;
  readonly view: ScreenView;
  readonly unmount: Cancel;
}

/**
 * Returns the Theme instances of one mount, empty until the first `sync`. A screen that changed place or size gets a
 * fresh instance on a fresh layer, so the scene is laid out again rather than stretched. A screen that only has more
 * or less height clear of its Dock keeps its layer, which still fits it, and gets a fresh instance on it.
 * @example
 * const instances = createScreenInstances(createAeroport(), layers, lifecycle);
 * instances.sync([builtin, external]); // two instances
 * instances.sync([builtin]); // the external screen's instance is unmounted and its layer closed
 * instances.sync([{ ...builtin, bottomInset: 75 }]); // the scene is laid out again above the Dock, on the same layer
 */
export function createScreenInstances<Layer>(
  theme: Theme<Layer>,
  layers: ScreenLayers<Layer>,
  lifecycle: ViewLifecycle,
): ScreenInstances {
  const instances = new Map<string, Instance<Layer>>();

  /** Unmounts one instance and gives its view back; its layer stays open. */
  const unmount = (instance: Instance<Layer>): void => {
    instance.unmount();
    // A Theme that forgot to cancel a subscription still stops receiving anything once unmounted.
    lifecycle.close(instance.view);
    instances.delete(instance.screen.id);
  };

  /** Unmounts one instance and gives its view and layer back. */
  const remove = (instance: Instance<Layer>): void => {
    unmount(instance);
    layers.close(instance.screen, instance.layer);
  };

  /** Mounts an instance on `screen`, on `layer`; a Theme that throws while mounting leaves no view or layer behind. */
  const mount = (screen: Screen, layer: Layer): void => {
    const view = lifecycle.open(screen);

    try {
      instances.set(screen.id, { screen, layer, view, unmount: theme.mount(layer, view.host) });
    } catch (error) {
      lifecycle.close(view);
      layers.close(screen, layer);
      throw error;
    }
  };

  return {
    sync(screens) {
      for (const instance of Array.from(instances.values())) {
        const reported = screens.find((screen) => screen.id === instance.screen.id);

        if (reported === undefined || !sameGeometry(reported, instance.screen)) {
          remove(instance);
        } else if (clearHeight(reported) !== clearHeight(instance.screen)) {
          unmount(instance);
          mount(reported, instance.layer);
        }
      }

      for (const screen of screens) {
        if (!instances.has(screen.id)) mount(screen, layers.open(screen));
      }
    },
    clear() {
      for (const instance of Array.from(instances.values())) remove(instance);
    },
  };
}
