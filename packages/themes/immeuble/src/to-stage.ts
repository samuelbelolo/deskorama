import type { Rect } from '@deskorama/core';
import { SCALE } from './grid.ts';

/**
 * Returns a native rectangle in screen pixels.
 * @example
 * toStage({ x: 15, y: 15, w: 15, h: 15 }); // { x: 60, y: 60, w: 60, h: 60 }
 */
export function toStage(r: Rect): Rect {
  return { x: r.x * SCALE, y: r.y * SCALE, w: r.w * SCALE, h: r.h * SCALE };
}
