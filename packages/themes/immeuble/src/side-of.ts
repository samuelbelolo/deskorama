import type { Screen } from '@deskorama/core';
import { holdsOrigin } from './holds-origin.ts';

/** Which part of the street a screen shows: the building itself, or the next building along with its vacant lot. */
export type Side = 'building' | 'next';

/**
 * Returns the part of the street a screen shows. The building stands on the screen that holds the desktop's origin;
 * every other screen shows the next building on the same street. Only the geometry decides, never a platform's
 * screen id.
 * @example
 * sideOf({ id: 'builtin', x: 0, y: 0, width: 1440, height: 900 }); // "building"
 * sideOf({ id: 'external', x: 1440, y: 0, width: 1600, height: 900 }); // "next"
 */
export function sideOf(screen: Screen): Side {
  return holdsOrigin(screen) ? 'building' : 'next';
}
