import { createScreenInstances, type ScreenInstances, type ViewLifecycle } from './create-screen-instances.ts';
import type { Screen } from './screen.ts';
import type { ScreenLayers } from './screen-layers.ts';
import type { Theme } from './theme.ts';

/**
 * Returns the single Theme instance of a page that draws one screen: on `layer`, on `screen` as it is now and for
 * good, whatever the other screens become.
 * @example
 * const instance = createFixedInstance(createAeroport(), layer, screen, lifecycle);
 * instance.sync([]); // mounted on `screen`, whatever the list says
 * instance.clear(); // unmounted, and `layer` left to the page
 */
export function createFixedInstance<Layer>(
  theme: Theme<Layer>,
  layer: Layer,
  screen: Screen,
  lifecycle: ViewLifecycle,
): ScreenInstances {
  const fixedLayer: ScreenLayers<Layer> = { open: () => layer, close: () => {} };
  const instances = createScreenInstances(theme, fixedLayer, lifecycle);

  return { sync: () => instances.sync([screen]), clear: () => instances.clear() };
}
