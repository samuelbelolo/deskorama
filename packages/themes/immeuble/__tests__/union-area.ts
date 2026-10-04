import type { Rect } from '@deskorama/core';

/**
 * Returns the area the rectangles cover together, overlaps counted once, on the 60 px grid every Gag is held on.
 * @example
 * unionArea([{ x: 0, y: 0, w: 120, h: 60 }, { x: 60, y: 0, w: 120, h: 60 }]); // 10800
 */
export function unionArea(rects: readonly Rect[]): number {
  const tiles = new Set<string>();

  for (const rect of rects)
    for (let x = Math.floor(rect.x / 60); x < Math.ceil((rect.x + rect.w) / 60); x += 1)
      for (let y = Math.floor(rect.y / 60); y < Math.ceil((rect.y + rect.h) / 60); y += 1) tiles.add(`${x},${y}`);

  return tiles.size * 3600;
}
