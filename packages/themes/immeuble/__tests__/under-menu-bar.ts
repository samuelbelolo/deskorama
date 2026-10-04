import type { Rect } from '@deskorama/core';

/**
 * Returns the part of a screen rectangle under the menu bar's tile row, which the menu bar always covers.
 * @example
 * underMenuBar({ x: 700, y: 48, w: 296, h: 112 }); // { x: 700, y: 60, w: 296, h: 100 }
 */
export function underMenuBar(rect: Rect): Rect {
  const y = Math.max(rect.y, 60);

  return { x: rect.x, y, w: rect.w, h: Math.max(0, rect.y + rect.h - y) };
}
