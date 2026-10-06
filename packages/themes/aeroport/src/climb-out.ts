import type { Point } from '@deskorama/core';
import { runwayWheels } from './runway-wheels.ts';

/**
 * Returns the fixed last stretch of the climb out of a terminal screen this wide whose ground ends at `groundEnd`, from
 * `a` to `b` (beyond its right edge): the same on every run, whatever the windows, so the screen on the right can
 * continue it.
 * @example
 * climbOut(1440, 900); // { a: { x: 1140, y: 724 }, b: { x: 1670, y: 600 } }
 */
export function climbOut(width: number, groundEnd: number): { readonly a: Point; readonly b: Point } {
  return { a: { x: width - 300, y: runwayWheels(groundEnd) - 90 }, b: { x: width + 230, y: groundEnd - 300 } };
}
