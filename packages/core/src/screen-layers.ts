import type { Screen } from './screen.ts';

/**
 * How the platform gives the engine a drawing surface per screen, so the engine can mount one Theme instance on
 * every screen and follow screens being plugged in, unplugged or rearranged.
 */
export interface ScreenLayers<Layer> {
  /** Returns a surface sized for `screen`, for a new Theme instance. */
  open(screen: Screen): Layer;
  /** Removes the surface once its Theme instance is unmounted: the screen left, or changed size or place. */
  close(screen: Screen, layer: Layer): void;
}
