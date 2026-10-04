import type { Rect } from '@deskorama/core';
import { boxOf } from './box-of.ts';

/**
 * Returns the boxes of everything Gags show right now: their held stages and, unless told otherwise, their Captions.
 * @example
 * gagBoxes(layer); // [{ x: 900, y: 720, w: 240, h: 120 }, { x: 960, y: 600, w: 312, h: 84 }]
 */
export function gagBoxes(layer: HTMLElement, withCaptions = true): Rect[] {
  const selector = withCaptions ? '[data-gag], [data-part="caption"]' : '[data-gag]';

  return Array.from(layer.querySelectorAll(selector)).flatMap((part) => boxOf(layer, part) ?? []);
}
