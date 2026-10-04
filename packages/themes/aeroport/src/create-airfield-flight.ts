import type { Cancel, WallpaperEvent } from '@deskorama/core';
import { deployStepOf } from './deploy-step-of.ts';
import { CAPTION_HOLD_MS } from './caption-room.ts';
import { STARTED_CAPTION_MS, type Flight, type FlightStage } from './flight.ts';
import { flyOver } from './fly-over.ts';
import { handoffDelay } from './handoff-delay.ts';
import { playAlarm } from './play-alarm.ts';
import { showSceneCaption } from './show-scene-caption.ts';

/**
 * Returns the PROD flight on an airfield screen, which never sees the plane at the threshold: a started deploy shows
 * its Caption under the board; a success shows its Caption as the plane flies over from the terminal; a failure
 * sends the fire truck out of its station toward the terminal.
 * @example
 * const flight = createAirfieldFlight({ ...stage, board });
 * flight.play(deploySucceeded);
 */
export function createAirfieldFlight(stage: FlightStage): Flight {
  const { board } = stage.layout;
  const near = { x: board.x + board.w - 150, y: board.y + board.h + 80 };
  const running: Cancel[] = [];

  const steps = {
    started(event: WallpaperEvent): void {
      running.push(showSceneCaption(stage, event, { near, duration: STARTED_CAPTION_MS }));
    },
    succeeded(event: WallpaperEvent): void {
      const delay = handoffDelay(event);
      const flight = flyOver(stage, event);
      const duration = flight.lasts + CAPTION_HOLD_MS;
      running.push(flight.stop, showSceneCaption(stage, event, { near, delay, duration }));
    },
    failed(event: WallpaperEvent): void {
      running.push(playAlarm(stage, event));
    },
  };

  return {
    play(event) {
      // A new step ends the one before it, its Caption included.
      for (const stop of running.splice(0)) stop();
      steps[deployStepOf(event)](event);
    },
    dispose() {
      for (const stop of running) stop();
      running.length = 0;
    },
  };
}
