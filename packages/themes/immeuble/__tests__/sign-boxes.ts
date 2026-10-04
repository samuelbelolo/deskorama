import type { Rect } from '@deskorama/core';
import { boxOf } from './box-of.ts';

/**
 * Returns the boxes of the permanent signs: the agency board, the kiosk poster, the hall's tally and the site sign.
 * @example
 * signBoxes(layer).length; // 4
 */
export function signBoxes(layer: HTMLElement): Rect[] {
  return Array.from(layer.querySelectorAll('[data-part="sign"]')).flatMap((sign) => boxOf(layer, sign) ?? []);
}
