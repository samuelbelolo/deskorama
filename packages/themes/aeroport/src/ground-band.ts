import type { Rect } from '@deskorama/core';
import { CAPTION_ROOM } from './caption-room.ts';
import type { Layout } from './layout.ts';

/** How far below the horizon the highest feet stand, so nobody stands on the terminal's plinth. */
const FEET_BELOW_HORIZON = 30;

/**
 * Returns where a ground Gag's room may be, for actors `height` tall: anywhere its feet land on the apron, the
 * runway or the grass, with its Caption and its tallest actor free to rise over the buildings or the sky.
 * @example
 * groundBand(layoutFor(host.screen), 92); // { x: 0, y: 448, w: 1440, h: 452 }
 */
export function groundBand(layout: Layout, height: number): Rect {
  const y = layout.horizon + FEET_BELOW_HORIZON - CAPTION_ROOM - Math.ceil(height);

  return { x: 0, y, w: layout.width, h: layout.height - y };
}
