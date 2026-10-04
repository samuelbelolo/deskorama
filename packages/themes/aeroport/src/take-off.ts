import type { Cancel, WallpaperEvent } from '@deskorama/core';
import type { DeployPlane } from './create-deploy-plane.ts';
import { fillTemplate } from './fill-template.ts';
import { christeningDelay } from './christening-delay.ts';
import { TIMING } from './flight-geometry.ts';
import { keyframe } from './keyframe.ts';
import { planeVisible } from './plane-visible.ts';
import { rollPlan } from './roll-plan.ts';
import { runTimeline } from './run-timeline.ts';
import { sceneSpeech } from './scene-speech.ts';
import type { Stage } from './stage.ts';
import { towerLine } from './tower-line.ts';
import { warpClock } from './warp-clock.ts';

/** How long the new name takes to appear on the fuselage. */
const CHRISTENING_MS = 700;

/** How long the tower's clearance stays on the radio. */
const CLEARANCE_MS = 2600;

/**
 * Plays the PROD flight's take-off from the threshold: the deploy's tag is painted on the fuselage as its name, the
 * tower clears it, and it rolls, rotates where the runway shows and climbs out of the right edge, spending its
 * hidden stretches fast. The last stretch is the same on every run, so the screen on the right continues it. Calls
 * `done` once the plane has left; returns what stops it early.
 * @example
 * const stop = takeOff(stage, plane, deploySucceeded, () => plane.node.remove());
 */
export function takeOff(stage: Stage, plane: DeployPlane, event: WallpaperEvent, done: () => void): Cancel {
  const { host, layout, text } = stage;
  const name = event.meta.tag.trim();
  const delay = christeningDelay(event);
  const start = plane.pose();

  const path = rollPlan(host, layout, start.x);
  const beforeHandoff = TIMING.roll + TIMING.climb - TIMING.handoff;
  const warp = warpClock(path, beforeHandoff, (gear) => planeVisible(host, layout, gear));

  const callsign = name === '' ? text.lines.callsign : `${text.lines.callsign} ${name}`;
  const clearance = fillTemplate(text.lines.clearance, { callsign });
  const speech = sceneSpeech(stage.root, host, [towerLine(layout, clearance, 0, CLEARANCE_MS)]);

  const stop = runTimeline(
    host.clock,
    host.reducedMotion,
    {
      duration: delay + TIMING.roll + TIMING.climb,
      // With reduced motion, the plane holds still at the moment it lifts its nose, its new name painted.
      still: delay + TIMING.roll,
      draw(elapsed) {
        const painted = keyframe(elapsed, [
          [0, 0],
          [CHRISTENING_MS, 1],
        ]);
        if (name !== '') plane.christen(name, host.reducedMotion ? 1 : painted);
        speech.draw(host.reducedMotion ? CLEARANCE_MS / 2 : elapsed);

        const real = elapsed - delay;
        if (real < 0) plane.place(start);
        else plane.place(path(real < beforeHandoff ? warp(real) : real));
      },
    },
    () => {
      speech.dispose();
      done();
    },
  );

  return () => {
    stop();
    speech.dispose();
  };
}
