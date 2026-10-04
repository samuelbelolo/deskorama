import type { Rect } from '@deskorama/core';
import { gagBoxes } from './gag-boxes.ts';

/**
 * Returns the smallest box holding everything the playing Gag shows right now (its actors, props and bubbles, not
 * its Caption), or null when it shows nothing.
 * @example
 * unionBox(layer); // { x: 120, y: 600, w: 640, h: 220 }
 */
export function unionBox(layer: HTMLElement): Rect | null {
  const boxes = gagBoxes(layer, false);
  if (boxes.length === 0) return null;

  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.w));
  const bottom = Math.max(...boxes.map((box) => box.y + box.h));

  return { x: left, y: top, w: right - left, h: bottom - top };
}
