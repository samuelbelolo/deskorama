import type { Rect } from '@deskorama/core';
import { SCALE } from './grid.ts';
import type { Layout } from './layout.ts';

/** Where each permanent sign lives, in screen pixels: no Gag and no plaque may land there. */
export interface SignHomes {
  /** The agency's board: the crowd and today's count. */
  readonly board: Rect;
  /** The kiosk's poster: the running total. */
  readonly poster: Rect;
  /** The hall's tally of intruders kept out today. */
  readonly hall: Rect;
}

/**
 * Returns the homes of the ground floor's signs, on whole tiles.
 * @example
 * signHomes(layoutFor(FAKE_SCREEN)).poster; // { x: 720, y: 660, w: 180, h: 120 }
 */
export function signHomes(layout: Layout): SignHomes {
  const y = layout.rdcY * SCALE;

  return {
    board: { x: 0, y, w: 240, h: 120 },
    poster: { x: 720, y, w: 180, h: 120 },
    hall: { x: 420, y, w: 120, h: 120 },
  };
}
