import type { Rect } from '@deskorama/core';
import type { DisplayArea } from './display-area.ts';

/**
 * Returns the windows that can hide the wallpaper, without those whose frame is exactly a whole display. On macOS 27
 * Notification Center keeps such a window, invisible, above every app; a real app window never covers the menu bar,
 * and a full-screen app lives on its own Space, where the wallpaper is not shown anyway. get-windows reports no
 * window level, so the frame is the only sign.
 * @example
 * withoutOverlays([{ x: 0, y: 0, w: 1728, h: 1117 }, { x: 0, y: 33, w: 900, h: 700 }], [builtin]);
 * // [{ x: 0, y: 33, w: 900, h: 700 }]
 */
export function withoutOverlays(windows: readonly Rect[], displays: readonly DisplayArea[]): Rect[] {
  return windows.filter(
    (frame) =>
      !displays.some(
        ({ bounds }) =>
          frame.x === bounds.x && frame.y === bounds.y && frame.w === bounds.width && frame.h === bounds.height,
      ),
  );
}
