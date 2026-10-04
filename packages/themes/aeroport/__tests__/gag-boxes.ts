import type { Rect } from '@deskorama/core';
import { boxOf } from './box-of.ts';

/**
 * Returns the boxes of everything a Gag shows right now (its actors, props and speech bubbles) and, unless told
 * otherwise, its Captions.
 * @example
 * gagBoxes(layer); // [{ x: 400, y: 680, w: 40, h: 44 }, ...]
 * gagBoxes(layer, false); // the actors, props and bubbles only
 */
export function gagBoxes(layer: HTMLElement, withCaptions = true): Rect[] {
  const selector = withCaptions ? '[data-gag], [data-part="caption"]' : '[data-gag]';
  const parts = Array.from(layer.querySelectorAll<HTMLElement>(selector));

  return parts
    .filter((part) => Number(part.style.opacity || '1') > 0)
    .flatMap((part) => boxOf(layer, part) ?? [])
    .filter((box) => box.w > 0 && box.h > 0);
}
