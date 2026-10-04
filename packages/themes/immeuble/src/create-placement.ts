import type { FreeSpot, Point, Rect, ScreenHost, SpotRequest } from '@deskorama/core';
import { TILE } from './grid.ts';
import type { Layout } from './layout.ts';
import { rowY } from './row-y.ts';

/** The named horizontal bands a Gag may ask for. */
export type Band = 'rdc' | 'sidewalk' | 'facade';

/** What a Gag asks for, in screen pixels. */
interface SpotAsk {
  readonly w: number;
  readonly h: number;
  readonly near?: Point;
  /** Holds the spot for this many Clock milliseconds; 0 or none only looks. */
  readonly hold?: number;
  readonly avoid?: readonly Rect[];
}

/** Where a Gag may play: in a band, anywhere visible, or on an exact rectangle. */
export interface Placement {
  inBand(band: Band, ask: SpotAsk): FreeSpot | null;
  anywhere(ask: SpotAsk): FreeSpot | null;
  /** The rectangle itself when it is fully visible and free. */
  exact(rect: Rect, hold: number): FreeSpot | null;
}

/**
 * Returns the placement helpers of one screen. Every spot comes from the host's `freeSpot`, fully visible and off
 * the reserved signs, and never in the bottom tile row, which the Dock covers on a MacBook, nor in the top one,
 * under the menu bar.
 * @example
 * const place = createPlacement(host, layout);
 * place.inBand('rdc', { w: 180, h: 120, near: { x: 480, y: 720 }, hold: 5000 });
 */
export function createPlacement(host: ScreenHost, layout: Layout): Placement {
  const { width, height } = layout;
  const bands: Readonly<Record<Band, Rect>> = {
    rdc: { x: 0, y: rowY(layout, 11), w: width, h: 2 * TILE },
    sidewalk: { x: 0, y: rowY(layout, 12), w: width, h: 2 * TILE },
    facade: { x: 0, y: TILE, w: width, h: rowY(layout, 11) - TILE },
  };
  const everywhere = { x: 0, y: TILE, w: width, h: height - 2 * TILE };
  const dock = { x: 0, y: height - TILE, w: width, h: TILE };

  const spot = (ask: SpotAsk, within: Rect): FreeSpot | null => {
    const request: SpotRequest = { w: ask.w, h: ask.h, within, avoid: [dock, ...(ask.avoid ?? [])] };
    const near = ask.near === undefined ? {} : { near: ask.near };
    const hold = ask.hold === undefined || ask.hold <= 0 ? {} : { hold: ask.hold };

    return host.freeSpot({ ...request, ...near, ...hold });
  };

  return {
    inBand: (band, ask) => spot(ask, bands[band]),
    anywhere: (ask) => spot(ask, everywhere),
    exact: (rect, hold) => (rect.y < TILE ? null : spot({ w: rect.w, h: rect.h, hold }, rect)),
  };
}
