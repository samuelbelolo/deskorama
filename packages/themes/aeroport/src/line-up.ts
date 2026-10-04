import type { Cancel, ScreenHost } from '@deskorama/core';
import type { DeployPlane } from './create-deploy-plane.ts';
import { EASE } from './ease.ts';
import { PLANE, TIMING } from './flight-geometry.ts';
import { holdingPoint } from './holding-point.ts';
import type { Layout } from './layout.ts';
import { lerp } from './lerp.ts';
import { runTimeline } from './run-timeline.ts';

/**
 * Taxis the PROD Caravelle in from beyond the left edge to the threshold of runway 09, rocking a little on its
 * gear, and leaves it there; with reduced motion it waits at the threshold. Returns what stops it early.
 * @example
 * const stop = lineUp(plane, host, layoutFor(host.screen));
 */
export function lineUp(plane: DeployPlane, host: ScreenHost, layout: Layout): Cancel {
  const hold = holdingPoint(layout);
  const from = PLANE.gear.x - PLANE.w - 40;

  return runTimeline(host.clock, host.reducedMotion, {
    duration: TIMING.taxi,
    draw(elapsed) {
      const p = elapsed / TIMING.taxi;
      const rock = Math.sin(p * Math.PI * 6) * 0.25 * (1 - p);
      plane.place({ x: lerp(from, hold.x, EASE.out(p)), y: hold.y, r: rock });
    },
  });
}
