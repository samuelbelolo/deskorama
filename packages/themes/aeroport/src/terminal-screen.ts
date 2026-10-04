import type { Screen } from '@deskorama/core';
import { holdsOrigin } from './holds-origin.ts';

/**
 * Returns the screen the terminal stands on, as an airfield screen sees it: the one holding the desktop's origin
 * among `screens`, or, when the host lists no such screen, one of the airfield's own size right beside it on the
 * left.
 * @example
 * terminalScreen([builtin, external], external); // builtin
 * terminalScreen([external], external); // { id: 'terminal', x: -160, y: 0, width: 1600, height: 900 }
 */
export function terminalScreen(screens: readonly Screen[], own: Screen): Screen {
  const listed = screens.find(holdsOrigin);
  if (listed !== undefined && listed.id !== own.id) return listed;

  return { id: 'terminal', x: own.x - own.width, y: own.y, width: own.width, height: own.height };
}
