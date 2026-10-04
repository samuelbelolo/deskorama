import type { Rect } from '@deskorama/core';
import type { Layout } from './layout.ts';
import { lotGeometry } from './lot-geometry.ts';

/**
 * Returns the native frames of the framed signs: the board of the crowd and today's count (the agency's, or the LED
 * panel on the vacant lot's hoarding next door), and the sign of the running total (the kiosk's poster, or the ad
 * painted on the lot's blind wall).
 * @example
 * signFrames(layoutFor(FAKE_SCREEN)).board; // { x: 3, y: 166, w: 56, h: 28 }
 */
export function signFrames(layout: Layout): { readonly board: Rect; readonly poster: Rect } {
  if (layout.side === 'next') {
    const lot = lotGeometry(layout);

    return { board: lot.led, poster: lot.mural };
  }

  return {
    board: { x: 3, y: layout.rdcY + 1, w: 56, h: 28 },
    poster: { x: 182, y: layout.rdcY + 2, w: 41, h: 26 },
  };
}
