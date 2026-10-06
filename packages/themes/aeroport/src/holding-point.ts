import type { Point } from '@deskorama/core';
import { PLANE } from './flight-geometry.ts';
import type { Layout } from './layout.ts';
import { runwayWheels } from './runway-wheels.ts';

/**
 * Returns where the main gear waits at the threshold of runway 09, the nose just past the painted bars.
 * @example
 * holdingPoint(layoutFor(builtin)); // { x: 255, y: 814 }
 */
export function holdingPoint(layout: Layout): Point {
  return { x: 30 + PLANE.gear.x, y: runwayWheels(layout.groundEnd) };
}
