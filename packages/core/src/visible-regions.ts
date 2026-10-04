import type { Cancel } from './clock.ts';
import type { Rect } from './rect.ts';
import type { FreeSpot, LargestFreeOptions, SpotRequest } from './spot-request.ts';

/**
 * Where a screen's wallpaper can be seen, on a grid of 60 px tiles: a tile is visible when no window frame touches
 * it. Every rectangle is in screen pixels, from the screen's top-left corner.
 */
export interface VisibleRegions {
  /** The share of `rect` (the whole screen by default) that is visible, from 0 to 1. */
  readonly visibleFraction: (rect?: Rect) => number;
  /** The largest fully visible rectangle, or null when nothing is visible. */
  readonly largestFree: (options?: LargestFreeOptions) => Rect | null;
  /** A fully visible spot that no Gag holds and no sign reserves, or null when none is big enough. */
  readonly freeSpot: (request: SpotRequest) => FreeSpot | null;
  /** Keeps every `freeSpot` off `rect` (a permanent sign) until the returned function is called. */
  readonly reserve: (rect: Rect) => Cancel;
  /** True while windows cover the whole screen: its Theme stops drawing. */
  readonly isHidden: () => boolean;
}
