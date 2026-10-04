import type { Screen } from '@deskorama/core';
import { MENU_BAR_HEIGHT, type DesktopWindow } from './desktop-layouts.ts';

/**
 * Returns the meeting window that covers a fake screen's whole wallpaper under its menu bar, shown when the visitor
 * hides the wallpaper.
 * @example
 * coverOf(BUILTIN_SCREEN); // { id: 'meeting', kind: 'meeting', title: '', x: 0, y: 25, w: 1440, h: 875 }
 */
export function coverOf(screen: Screen): DesktopWindow {
  return {
    id: 'meeting',
    kind: 'meeting',
    title: '',
    x: 0,
    y: MENU_BAR_HEIGHT,
    w: screen.width,
    h: screen.height - MENU_BAR_HEIGHT,
  };
}
