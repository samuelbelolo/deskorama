import type { Point } from '@deskorama/core';
import { MENU_BAR_HEIGHT } from './desktop-layouts.ts';

/** How much of a window always stays on screen, so its title bar can be caught again. */
const KEEP_VISIBLE = 80;

/** The height of a fake window's title bar. */
const TITLE_BAR = 28;

/**
 * Returns where a dragged window may stand: under the menu bar, with its title bar always on screen.
 * @example
 * clampWindow({ x: -900, y: 0 }, { w: 620, h: 400 }, { width: 1440, height: 900 }); // { x: -540, y: 25 }
 */
export function clampWindow(
  position: Point,
  size: { readonly w: number; readonly h: number },
  screen: { readonly width: number; readonly height: number },
): Point {
  return {
    x: Math.round(Math.min(Math.max(position.x, KEEP_VISIBLE - size.w), screen.width - KEEP_VISIBLE)),
    y: Math.round(Math.min(Math.max(position.y, MENU_BAR_HEIGHT), screen.height - TITLE_BAR)),
  };
}
