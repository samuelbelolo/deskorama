import type { Screen } from '@deskorama/core';

/**
 * Returns true when a screen covers the desktop's origin.
 * @example
 * holdsOrigin({ id: 'left', x: -1600, y: 0, width: 1600, height: 900 }); // false
 */
export function holdsOrigin(screen: Screen): boolean {
  return screen.x <= 0 && screen.x + screen.width > 0 && screen.y <= 0 && screen.y + screen.height > 0;
}
