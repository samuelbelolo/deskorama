import type { VisibleRegions } from '@deskorama/core';
import { PLANE, TIMING, type GearPose } from './flight-geometry.ts';
import { climbOut } from './climb-out.ts';
import { pitchOf } from './pitch-of.ts';
import { runwayWheels } from './runway-wheels.ts';
import { keyframe } from './keyframe.ts';
import type { Layout } from './layout.ts';
import { lerp } from './lerp.ts';

/** The shortest and the longest the plane rolls before it lifts its nose. */
const SHORTEST_ROLL = 120;
const LONGEST_ROLL = 560;

/** How wide a slice of runway is checked at a time. */
const SLICE = 40;

/**
 * Returns the take-off from the threshold, as the gear's pose `t` ms after the roll starts. The plane rotates at 60 %
 * of the runway visible ahead of its nose, so the rotation happens in view, and rolls a short way at least when a
 * window hides the runway (the warped clock then spends that hidden stretch fast). The climb always ends with the
 * same stretch out of the right edge, which the screen on the right continues.
 * @example
 * const path = rollPlan(host, layoutFor(host.screen), 255);
 * path(TIMING.roll); // the gear at the rotation point, nose 7° up
 */
export function rollPlan(regions: VisibleRegions, layout: Layout, gearX: number): (t: number) => GearPose {
  const ground = runwayWheels(layout.height);
  const span = visibleRunway(regions, layout, gearX + PLANE.noseAhead);
  const rotateX = gearX + Math.min(Math.max(0.6 * span, SHORTEST_ROLL), LONGEST_ROLL);
  const { a, b } = climbOut(layout.width, layout.height);
  const climbA = TIMING.climb - TIMING.handoff;
  const finalPitch = pitchOf(a, b);

  return (t) => {
    if (t < TIMING.roll) {
      const p = t / TIMING.roll;
      const pitch = keyframe(p, [
        [0.8, 0],
        [1, 7],
      ]);

      return { x: gearX + (rotateX - gearX) * p ** 3, y: ground, r: -pitch };
    }

    if (t < TIMING.roll + climbA) {
      const u = (t - TIMING.roll) / climbA;

      return { x: lerp(rotateX, a.x, u), y: ground - (ground - a.y) * u ** 1.6, r: lerp(-7, finalPitch, u) };
    }

    const u = Math.min(1, (t - TIMING.roll - climbA) / TIMING.handoff);

    return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), r: finalPitch };
  };
}

/**
 * Returns how far the runway stays visible ahead of the nose, checking the fuselage's band slice by slice.
 * @example
 * visibleRunway(host, layoutFor(host.screen), 474); // 486 when a window starts at x 980
 */
function visibleRunway(regions: VisibleRegions, layout: Layout, noseX: number): number {
  const ground = runwayWheels(layout.height);
  const band = { y: ground - 47 * PLANE.scale, h: 24 * PLANE.scale };

  let x = noseX;
  while (x + SLICE <= layout.width && regions.visibleFraction({ x, y: band.y, w: SLICE, h: band.h }) === 1) x += SLICE;

  return x - noseX;
}
