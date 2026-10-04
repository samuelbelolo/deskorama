import type { Point } from '@deskorama/core';

/**
 * Returns the pitch of a straight climb from `a` to `b`, in degrees, negative nose up.
 * @example
 * pitchOf({ x: 1140, y: 724 }, { x: 1670, y: 600 }); // about -13.2
 */
export function pitchOf(a: Point, b: Point): number {
  return -Math.atan2(a.y - b.y, b.x - a.x) * (180 / Math.PI);
}
