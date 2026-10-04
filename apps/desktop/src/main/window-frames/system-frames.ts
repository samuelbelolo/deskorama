import type { Rect } from '@deskorama/core';
import type { DisplayArea } from './display-area.ts';

/**
 * Returns the frames of what macOS draws over the wallpaper on each display, the menu bar and the Dock, as the
 * strips between the display's bounds and its work area. get-windows does not list them.
 * @example
 * systemFrames([{ id: 1, bounds: { x: 0, y: 0, width: 1728, height: 1117 },
 *   workArea: { x: 0, y: 33, width: 1728, height: 1014 } }]);
 * // [{ x: 0, y: 0, w: 1728, h: 33 }, { x: 0, y: 1047, w: 1728, h: 70 }]
 */
export function systemFrames(displays: readonly DisplayArea[]): Rect[] {
  return displays.flatMap(({ bounds, workArea }) => {
    const top = workArea.y - bounds.y;
    const left = workArea.x - bounds.x;
    const bottom = bounds.y + bounds.height - (workArea.y + workArea.height);
    const right = bounds.x + bounds.width - (workArea.x + workArea.width);

    const strips: Rect[] = [
      { x: bounds.x, y: bounds.y, w: bounds.width, h: top },
      { x: bounds.x, y: workArea.y + workArea.height, w: bounds.width, h: bottom },
      { x: bounds.x, y: bounds.y, w: left, h: bounds.height },
      { x: workArea.x + workArea.width, y: bounds.y, w: right, h: bounds.height },
    ];

    return strips.filter((strip) => strip.w > 0 && strip.h > 0);
  });
}
