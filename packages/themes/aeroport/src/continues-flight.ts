import type { Screen } from '@deskorama/core';

/** How far apart two screens may be and still count as side by side, in pixels. */
const ADJACENT_GAP = 1;

/**
 * Returns true when a plane climbing out of the terminal's right edge flies on into `own`: the screen's left edge
 * touches the terminal's right edge and the two share some height. A screen further right never flies a plane of its
 * own.
 * @example
 * continuesFlight(builtin, external); // true
 * continuesFlight(builtin, { id: 'left', x: -1600, y: 0, width: 1600, height: 900 }); // false
 */
export function continuesFlight(terminal: Screen, own: Screen): boolean {
  const touching = Math.abs(own.x - (terminal.x + terminal.width)) <= ADJACENT_GAP;
  const level = own.y < terminal.y + terminal.height && own.y + own.height > terminal.y;

  return touching && level;
}
