import type { Screen } from '@deskorama/core';
import { holdsOrigin } from './holds-origin.ts';

/** Which part of the airport a screen shows: the terminal with runway 09, or the airfield beyond it. */
export type Side = 'terminal' | 'airfield';

/**
 * Returns the side of the airport a screen shows. The terminal stands on the screen that holds the desktop's origin
 * (the main display, the one with the menu bar); every other screen shows the airfield. Only the geometry decides,
 * never a platform's screen id, so it holds when a host lists its own screen alone.
 * @example
 * sideOf({ id: 'builtin', x: 0, y: 0, width: 1440, height: 900 }); // "terminal"
 * sideOf({ id: 'external', x: 1440, y: 0, width: 1600, height: 900 }); // "airfield"
 */
export function sideOf(screen: Screen): Side {
  return holdsOrigin(screen) ? 'terminal' : 'airfield';
}
