import type { BuildState, Cancel, WallpaperEvent } from '@deskorama/core';
import { CAPTION_HOLD_MS } from './caption-room.ts';
import { christeningDelay } from './christening-delay.ts';
import { createRunwayHold, type RunwayHold } from './create-runway-hold.ts';
import { deployStepOf } from './deploy-step-of.ts';
import { STARTED_CAPTION_MS, type Flight, type FlightStage } from './flight.ts';
import { PLANE, TIMING } from './flight-geometry.ts';
import { holdingPoint } from './holding-point.ts';
import { lineUp } from './line-up.ts';
import { playJackpot } from './play-jackpot.ts';
import { showSceneCaption } from './show-scene-caption.ts';
import { takeOff } from './take-off.ts';
import { towAway } from './tow-away.ts';

/** Where the PROD flight stands: nothing on the runway, a plane waiting for its build, one taking off, or a wreck. */
type Phase = 'none' | 'waiting' | 'flying' | 'stranded';

/** The flight's state, shared by its steps and by what follows the build Gauge. */
interface FlightState {
  readonly runway: RunwayHold;
  phase: Phase;
  running: Cancel | null;
}

/**
 * Returns the PROD flight on the terminal side. A started deploy taxis the Caravelle to the threshold of runway 09,
 * where it waits, reserved, while the build runs; a success christens it with the deploy's tag and it takes off; a
 * failure plays the legendary scene and leaves it foamed on the runway, with the fire truck, until the next deploy
 * starts and a tug tows it away. A step may come without the one before it (a success with no line-up, a failure
 * replayed after the recap): the plane then appears at the threshold. The runway also follows the build Gauge, which
 * moves while the wallpaper is hidden too: a build running with no plane brings one to wait, and a waiting plane
 * whose build ended without a step it saw leaves.
 * @example
 * const flight = createTerminalFlight({ ...stage, board });
 * flight.play(deployStarted);
 */
export function createTerminalFlight(stage: FlightStage): Flight {
  const { host, layout } = stage;
  const state: FlightState = { runway: createRunwayHold(stage), phase: 'none', running: null };
  const hold = holdingPoint(layout);
  const near = { x: hold.x + 40, y: hold.y - PLANE.gear.y - 70 };
  const captions: Cancel[] = [];

  const caption = (event: WallpaperEvent, duration: number): void => {
    captions.push(showSceneCaption(stage, event, { near, duration }));
  };

  const steps = {
    started(event: WallpaperEvent): void {
      caption(event, STARTED_CAPTION_MS);
      lineUpNext(stage, state);
    },
    succeeded(event: WallpaperEvent): void {
      caption(event, christeningDelay(event) + TIMING.roll + TIMING.climb + CAPTION_HOLD_MS);
      takeOffNow(stage, state, event);
    },
    failed(event: WallpaperEvent): void {
      state.phase = 'stranded';
      state.runway.stranded(playJackpot(stage, state.runway.atThreshold(), event));
    },
  };

  // The engine moves the Gauge before it hands over the step: the build is followed a tick later, once the step played.
  let following: Cancel | null = null;
  const stopGauges = host.onGauges(({ build }) => {
    following?.();
    following = host.clock.after(0, () => followBuild(state, build));
  });
  followBuild(state, host.gauges().build);

  return {
    play(event) {
      // A new step ends the one before it, its Caption included.
      state.running?.();
      state.running = null;
      for (const stop of captions.splice(0)) stop();
      steps[deployStepOf(event)](event);
    },
    dispose() {
      stopGauges();
      following?.();
      state.running?.();
      for (const stop of captions) stop();
      state.runway.dispose();
    },
  };
}

/**
 * Brings the plane of a started deploy to the threshold: a wreck is towed away first, a plane already there stays,
 * any other taxis in from the left edge.
 * @example
 * lineUpNext(stage, state); // state.phase === 'waiting'
 */
function lineUpNext(stage: FlightStage, state: FlightState): void {
  const { runway } = state;
  const plane = runway.plane();
  const wreck = runway.wreck();
  const arrive = (): void => {
    state.running = lineUp(runway.arriving(), stage.host, stage.layout);
  };

  state.phase = 'waiting';

  if (wreck !== null && plane !== null) {
    // A deploy started during the show stops it first, so only the tow moves the plane.
    wreck.stop();
    state.running = towAway(stage, plane, wreck, () => {
      runway.towed();
      arrive();
    });
  } else if (plane === null) arrive();
  else runway.atThreshold();
}

/**
 * Takes off with the plane at the threshold, bringing it there first if needed. Stopped early by the next step, the
 * take-off gives its plane up, so that step starts from a clear runway.
 * @example
 * takeOffNow(stage, state, deploySucceeded); // state.phase === 'flying' until the plane is gone
 */
function takeOffNow(stage: FlightStage, state: FlightState, event: WallpaperEvent): void {
  const leaving = state.runway.atThreshold();
  const gone = (): void => {
    state.runway.left(leaving);
    if (state.phase === 'flying') state.phase = 'none';
  };

  state.phase = 'flying';
  const stop = takeOff(stage, leaving, event, gone);
  state.running = () => {
    stop();
    gone();
  };
}

/**
 * Makes the runway agree with the build Gauge when no step said so: a running build with nothing on the runway
 * brings a plane to wait at the threshold; a waiting plane whose build is no longer running leaves.
 * @example
 * followBuild(state, 'building'); // a plane waits at the threshold
 */
function followBuild(state: FlightState, build: BuildState): void {
  if (build === 'building' && state.phase === 'none') {
    state.runway.atThreshold();
    state.phase = 'waiting';

    return;
  }

  if (build === 'building' || state.phase !== 'waiting') return;

  state.running?.();
  state.running = null;
  const plane = state.runway.plane();
  if (plane !== null) state.runway.left(plane);
  state.phase = 'none';
}
