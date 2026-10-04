import type { Screen } from '@deskorama/core';

/**
 * Returns true when a screen covers the desktop's origin: the main display, the one with the menu bar.
 * @example
 * holdsOrigin({ id: 'builtin', x: 0, y: 0, width: 1440, height: 900 }); // true
 * holdsOrigin({ id: 'left', x: -1600, y: 0, width: 1600, height: 900 }); // false
 */
export function holdsOrigin(screen: Screen): boolean {
  return screen.x <= 0 && screen.x + screen.width > 0 && screen.y <= 0 && screen.y + screen.height > 0;
}
