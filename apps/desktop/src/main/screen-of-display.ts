import type { Screen } from '@deskorama/core';
import { bottomStrip } from './window-frames/bottom-strip.ts';
import type { DisplayArea } from './window-frames/display-area.ts';

/**
 * Returns the core Screen of an Electron display: its whole area, menu bar included, in points (CSS pixels), and the
 * room a Dock along its bottom edge takes, read from its work area.
 * @example
 * screenOfDisplay({ id: 1, bounds: { x: 0, y: 0, width: 1728, height: 1117 },
 *   workArea: { x: 0, y: 33, width: 1728, height: 1009 } });
 * // { id: '1', x: 0, y: 0, width: 1728, height: 1117, bottomInset: 75 }
 * screenOfDisplay({ id: 2, bounds: { x: 1728, y: 0, width: 2560, height: 1440 },
 *   workArea: { x: 1728, y: 25, width: 2560, height: 1415 } });
 * // { id: '2', x: 1728, y: 0, width: 2560, height: 1440 }
 */
export function screenOfDisplay(display: DisplayArea): Screen {
  const { x, y, width, height } = display.bounds;
  const screen = { id: String(display.id), x, y, width, height };
  const bottomInset = bottomStrip(display);

  return bottomInset > 0 ? { ...screen, bottomInset } : screen;
}
