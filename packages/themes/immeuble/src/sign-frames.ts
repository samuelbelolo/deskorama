import type { Rect } from '@deskorama/core';
import type { Layout } from './layout.ts';

/**
 * Returns the native frames of the ground floor's framed signs: the agency's board and the kiosk's poster.
 * @example
 * signFrames(layoutFor(FAKE_SCREEN)).board; // { x: 3, y: 166, w: 56, h: 28 }
 */
export function signFrames(layout: Layout): { readonly board: Rect; readonly poster: Rect } {
  return {
    board: { x: 3, y: layout.rdcY + 1, w: 56, h: 28 },
    poster: { x: 182, y: layout.rdcY + 2, w: 41, h: 26 },
  };
}
