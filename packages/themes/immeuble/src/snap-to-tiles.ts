import type { Rect } from '@deskorama/core';
import { TILE } from './grid.ts';

/**
 * Returns the smallest block of whole tiles that holds a screen rectangle, so a sign's home is exactly what the
 * host reserves for it.
 * @example
 * snapToTiles({ x: 1316, y: 664, w: 224, h: 112 }); // { x: 1260, y: 660, w: 300, h: 120 }
 */
export function snapToTiles(rect: Rect): Rect {
  const x = Math.floor(rect.x / TILE) * TILE;
  const y = Math.floor(rect.y / TILE) * TILE;

  return {
    x,
    y,
    w: Math.ceil((rect.x + rect.w) / TILE) * TILE - x,
    h: Math.ceil((rect.y + rect.h) / TILE) * TILE - y,
  };
}
