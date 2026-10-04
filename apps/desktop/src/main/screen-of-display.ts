import type { Screen } from '@deskorama/core';

/** The part of an Electron display the app reads: its id and its bounds in desktop coordinates. */
export interface DisplayBounds {
  readonly id: number;
  readonly bounds: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
}

/**
 * Returns the core Screen of an Electron display: its whole area, menu bar included, in points (CSS pixels).
 * @example
 * screenOfDisplay({ id: 1, bounds: { x: 0, y: 0, width: 1728, height: 1117 } });
 * // { id: '1', x: 0, y: 0, width: 1728, height: 1117 }
 */
export function screenOfDisplay(display: DisplayBounds): Screen {
  const { x, y, width, height } = display.bounds;
  return { id: String(display.id), x, y, width, height };
}
