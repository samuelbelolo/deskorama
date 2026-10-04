import type { Rect } from '@deskorama/core';
import { boxOf } from './box-of.ts';

/**
 * Returns the boxes of everything a Gag shows right now (its actors, props and speech bubbles) and its Captions.
 * @example
 * gagBoxes(layer); // [{ x: 400, y: 680, w: 40, h: 44 }, ...]
 */
export function gagBoxes(layer: HTMLElement): Rect[] {
  const parts = Array.from(layer.querySelectorAll<HTMLElement>('[data-gag], [data-part="caption"]'));

  return parts.filter((part) => Number(part.style.opacity || '1') > 0).flatMap((part) => boxOf(layer, part) ?? []);
}
