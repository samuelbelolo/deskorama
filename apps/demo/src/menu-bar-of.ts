import type { Rect, Screen } from '@deskorama/core';
import { MENU_BAR_HEIGHT } from './desktop-layouts.ts';

/**
 * Returns the menu bar across the top of a fake screen, in its own pixels.
 * @example
 * menuBarOf(EXTERNAL_SCREEN); // { x: 0, y: 0, w: 1600, h: 25 }
 */
export function menuBarOf(screen: Screen): Rect {
  return { x: 0, y: 0, w: screen.width, h: MENU_BAR_HEIGHT };
}
