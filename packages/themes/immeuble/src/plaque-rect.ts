import type { Rect } from '@deskorama/core';
import type { Plaque } from './plaque.ts';
import { rowTops } from './row-tops.ts';
import { rowWidth } from './row-width.ts';

/**
 * Returns the rectangle a plaque is drawn in, in native pixels: as wide as its widest row with its margins, centred
 * in its held block.
 * @example
 * plaqueRect(plaque); // { x: 140, y: 176, w: 78, h: 21 }
 */
export function plaqueRect(plaque: Plaque): Rect {
  const { box, rows } = plaque;
  const height = rowTops(rows).height;
  const width = Math.min(box.w, Math.max(...rows.map(rowWidth)) + (box.w < 40 ? 2 : 4));

  return {
    x: Math.round(box.x + (box.w - width) / 2),
    y: Math.round(box.y + (box.h - height) / 2),
    w: width,
    h: height,
  };
}
