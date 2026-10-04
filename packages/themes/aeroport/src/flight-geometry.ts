import type { Point } from '@deskorama/core';
import { CARAVELLE } from './caravelle-markup.ts';

/** The PROD Caravelle's size on screen. */
const SCALE = 1.5;

/** The PROD Caravelle's size and the point it is placed by, in pixels. */
interface PlaneShape {
  readonly scale: number;
  readonly w: number;
  readonly h: number;
  /** Its main gear, from the sprite's top-left corner. */
  readonly gear: Point;
  /** How far its nose reaches ahead of its main gear. */
  readonly noseAhead: number;
}

/** The PROD Caravelle, facing right, placed by its main gear. */
export const PLANE: PlaneShape = {
  scale: SCALE,
  w: CARAVELLE.w * SCALE,
  h: CARAVELLE.h * SCALE,
  gear: { x: 150 * SCALE, y: CARAVELLE.wheels * SCALE },
  noseAhead: 146 * SCALE,
};

/** The PROD flight's timing, in milliseconds. */
export const TIMING = {
  /** From the left edge to the threshold. */
  taxi: 3000,
  /** The take-off roll, then the climb out of the screen. */
  roll: 2600,
  climb: 2800,
  /** The last stretch of the climb, the same on every run, which the screen on the right continues. */
  handoff: 1600,
  /** Across the screen on the right, after the hand-off. */
  beyond: 5800,
} as const;

/** How long a christened plane waits for its new name to dry before it rolls; an unnamed one only waits a moment. */
export const NAMED_DELAY = 900;
export const UNNAMED_DELAY = 300;

/** A point of the flight: where the main gear is and how far the nose is pitched, in degrees, negative nose up. */
export interface GearPose extends Point {
  readonly r: number;
}

/** The steepest the PROD Caravelle ever climbs, in degrees. */
export const STEEPEST_CLIMB = 14;
