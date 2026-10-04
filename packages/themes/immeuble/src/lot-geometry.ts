import type { Rect } from '@deskorama/core';
import { BAY } from './grid.ts';
import type { Layout } from './layout.ts';
import { SIGN_W } from './site-geometry.ts';

/** How many bays wide the next building is; the vacant lot fills the rest of the screen. */
export const NEXT_BAYS = 15;

/** The size of the LED panel and of the painted wall, in native pixels. */
const LED = { w: 56, h: 28 } as const;
const MURAL = { w: 128, h: 58 } as const;

/** Where the parts of the vacant lot stand, in native pixels. */
export interface LotGeometry {
  /** The lot's left edge, just past the next building. */
  readonly x: number;
  /** The top of the green hoarding that closes the lot along the street. */
  readonly hoardY: number;
  /** The site sign bolted to the hoarding, its left end. */
  readonly sign: Rect;
  /** The LED panel bolted to the hoarding, its right end: the crowd and today's count. */
  readonly led: Rect;
  /** The ad painted on the blind wall at the back of the lot: the running total. */
  readonly mural: Rect;
  /** The x of the scaffold tower that stands in the lot while a deploy runs. */
  readonly tower: number;
}

/**
 * Returns where the vacant lot's parts stand on a screen showing the next building: the sign and the LED panel
 * spread along the hoarding with even gaps (the panel on the wall above the sign when the lot is too narrow), the
 * painted wall centred over the lot.
 * @example
 * lotGeometry(layoutFor(EXTERNAL)).led; // { x: 329, y: 166, w: 56, h: 28 } on a 1600 px screen
 */
export function lotGeometry(layout: Layout): LotGeometry {
  const x = NEXT_BAYS * BAY + 1;
  const room = layout.W - x;
  const gap = Math.max(2, Math.floor((room - SIGN_W - LED.w) / 3));
  const sign = { x: x + gap, y: layout.rdcY + 1, w: SIGN_W, h: 28 };

  // A lot too narrow for both on the hoarding hangs the panel on the wall above the sign.
  const fits = room >= SIGN_W + LED.w + 4;
  const led = fits
    ? { x: layout.W - gap - LED.w, y: sign.y, w: LED.w, h: LED.h }
    : { x: sign.x, y: sign.y - LED.h - 4, w: LED.w, h: LED.h };

  return {
    x,
    hoardY: layout.rdcY + 2,
    sign,
    led,
    mural: { x: x + Math.floor((room - MURAL.w) / 2), y: layout.top + 48, w: MURAL.w, h: MURAL.h },
    tower: sign.x + sign.w + 12,
  };
}
