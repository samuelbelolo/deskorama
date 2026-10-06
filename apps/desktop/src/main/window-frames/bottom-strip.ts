import type { DisplayArea } from './display-area.ts';

/**
 * Returns the height of what macOS keeps along the bottom edge of a display, the Dock: the gap between the bottom
 * of its bounds and the bottom of its work area, 0 when the Dock is elsewhere or hidden.
 * @example
 * bottomStrip({ id: 1, bounds: { x: 0, y: 0, width: 1728, height: 1117 },
 *   workArea: { x: 0, y: 33, width: 1728, height: 1009 } }); // 75
 */
export function bottomStrip({ bounds, workArea }: DisplayArea): number {
  return bounds.y + bounds.height - (workArea.y + workArea.height);
}
