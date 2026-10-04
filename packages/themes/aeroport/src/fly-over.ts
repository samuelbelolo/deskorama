import type { Cancel, WallpaperEvent } from '@deskorama/core';
import { createDeployPlane } from './create-deploy-plane.ts';
import { TIMING, type GearPose } from './flight-geometry.ts';
import { handoffDelay } from './handoff-delay.ts';
import { outPath } from './out-path.ts';
import { planeVisible } from './plane-visible.ts';
import { runTimeline } from './run-timeline.ts';
import type { Stage } from './stage.ts';
import { continuesFlight } from './continues-flight.ts';
import { terminalScreen } from './terminal-screen.ts';
import { warpClock } from './warp-clock.ts';

/** With reduced motion, how far past the hand-off the plane holds still over this screen. */
const STILL_AFTER_HANDOFF = 1500;

/** The PROD flight over an airfield screen: what stops it early, and how long it lasts after the hand-off. */
export interface FlyOver {
  readonly stop: Cancel;
  readonly lasts: number;
}

/**
 * Continues the PROD flight over the airfield screen touching the terminal's right edge: the plane, already
 * christened, enters at the left edge where it leaves the terminal, at the moment it leaves it, then heads for the
 * free sky over this screen and out of it, spending its hidden stretches fast. A screen elsewhere sees no plane.
 * @example
 * const { stop, lasts } = flyOver(stage, deploySucceeded);
 */
export function flyOver(stage: Stage, event: WallpaperEvent): FlyOver {
  const { host, layout, text } = stage;
  const own = host.screen;
  const terminal = terminalScreen(host.screens(), own);
  if (!continuesFlight(terminal, own)) return { stop: () => {}, lasts: TIMING.handoff };

  const path = outPath(host, layout, { own, terminal });
  const beyond = (t: number): GearPose => path.at(TIMING.handoff + t);
  const warp = warpClock(beyond, path.beyond, (gear) => planeVisible(host, layout, gear));

  const start = handoffDelay(event);
  const plane = createDeployPlane(stage.root, text.paint.flight, path.at(0));
  const name = event.meta.tag.trim();
  if (name !== '') plane.christen(name, 1);

  const stop = runTimeline(
    host.clock,
    host.reducedMotion,
    {
      duration: start + TIMING.handoff + path.beyond,
      still: start + TIMING.handoff + STILL_AFTER_HANDOFF,
      draw(elapsed) {
        const real = elapsed - start;
        if (real < 0) plane.place(path.at(0), 0);
        else if (real < TIMING.handoff) plane.place(path.at(real));
        else plane.place(beyond(warp(real - TIMING.handoff)));
      },
    },
    () => plane.node.remove(),
  );

  return {
    stop() {
      stop();
      plane.node.remove();
    },
    lasts: TIMING.handoff + path.beyond,
  };
}
