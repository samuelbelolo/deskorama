import type { Rect } from '@deskorama/core';
import { SCALE } from './grid.ts';

/**
 * Returns a screen rectangle in native pixels, snapped to whole pixels.
 * @example
 * toNative({ x: 60, y: 60, w: 120, h: 60 }); // { x: 15, y: 15, w: 30, h: 15 }
 */
export function toNative(r: Rect): Rect {
  return {
    x: Math.round(r.x / SCALE),
    y: Math.round(r.y / SCALE),
    w: Math.round(r.w / SCALE),
    h: Math.round(r.h / SCALE),
  };
}
