import type { Rect, Screen } from '@deskorama/core';
import { coverOf } from './cover-of.ts';
import type { DesktopLayout, DesktopWindow } from './desktop-layouts.ts';
import { menuBarOf } from './menu-bar-of.ts';

/**
 * Returns everything that covers one fake screen's wallpaper: its menu bar, its Dock when it has one, its windows,
 * and the meeting window while the wallpaper is hidden, as plain rectangles in the screen's own pixels.
 * @example
 * desktopOccluders(BUILTIN_SCREEN, BUILTIN_DESKTOP, DESKTOP_WINDOWS, false); // [menu bar, Dock, editor, terminal, browser]
 * desktopOccluders(EXTERNAL_SCREEN, EXTERNAL_DESKTOP, EXTERNAL_DESKTOP.windows, true); // [menu bar, docs, meeting]
 */
export function desktopOccluders(
  screen: Screen,
  layout: DesktopLayout,
  windows: readonly DesktopWindow[],
  covered: boolean,
): Rect[] {
  const bars = layout.dock === null ? [menuBarOf(screen)] : [menuBarOf(screen), layout.dock];
  const shown = covered ? [...windows, coverOf(screen)] : windows;

  return [...bars, ...shown.map(({ x, y, w, h }) => ({ x, y, w, h }))];
}
