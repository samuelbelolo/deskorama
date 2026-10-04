import type { Cancel } from './clock.ts';
import type { ScreenHost } from './screen-host.ts';

/**
 * An animated scene drawn as the wallpaper, mounted once per screen.
 * `Layer` is the surface the Theme draws into: an `HTMLElement` in a browser, anything in a test.
 */
export interface Theme<Layer> {
  /** A stable identifier, e.g. "aeroport". */
  readonly name: string;
  /** Draws the scene into `layer` and reacts to the host's Events; returns what removes it. */
  mount(layer: Layer, host: ScreenHost): Cancel;
}
