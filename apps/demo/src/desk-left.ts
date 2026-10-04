import type { Screen } from '@deskorama/core';

/** The bezel drawn between two fake screens, in desk pixels; the desktop itself has no gap. */
const SCREEN_GAP = 48;

/**
 * Returns where a fake screen stands on the page's desk: its place in the desktop, plus a bezel per screen on its
 * left.
 * @example
 * deskLeft(BUILTIN_SCREEN, 0); // 0
 * deskLeft(EXTERNAL_SCREEN, 1); // 1488: 1440 plus one bezel
 */
export function deskLeft(screen: Screen, index: number): number {
  return screen.x + index * SCREEN_GAP;
}
