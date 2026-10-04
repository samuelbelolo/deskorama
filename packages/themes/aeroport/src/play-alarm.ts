import type { Cancel, WallpaperEvent } from '@deskorama/core';
import { createFireTruck } from './create-fire-truck.ts';
import { createSlate } from './create-slate.ts';
import { EASE } from './ease.ts';
import { failedDeployFrame } from './failed-deploy-frame.ts';
import type { FlightStage } from './flight.ts';
import { keyframe } from './keyframe.ts';
import { lerp } from './lerp.ts';
import { runTimeline } from './run-timeline.ts';
import { terminalScreen } from './terminal-screen.ts';

/** How long the alarm plays: the slate, under which the truck races out. */
const SHOW_MS = 6000;

/** The truck leaves bay 1 and races off the edge that faces the terminal. */
const RACE = { from: 300, to: 2700 } as const;

/** With reduced motion, the instant held still: the truck just out of its bay. */
const STILL_MS = 1100;

/**
 * Plays the failed deploy on an airfield screen: the airport dims around the fire station, the fire truck tears
 * out of bay 1 with its lamps blinking and races off the edge that faces the terminal, and the signature line shows
 * wherever the windows leave room. Returns what stops it early.
 * @example
 * const stop = playAlarm(stage, deployFailed);
 */
export function playAlarm(stage: FlightStage, event: WallpaperEvent): Cancel {
  const { host, layout, text } = stage;
  const { station } = layout;
  const feet = layout.horizon + 4;

  const layer = document.createElement('div');
  layer.className = 'aeroport-gag';
  stage.root.append(layer);

  // The terminal on the right sends the truck out to the right, mirrored.
  const toRight = terminalScreen(host.screens(), host.screen).x > host.screen.x;
  const exit = toRight ? layout.width + 60 : -260;

  const slate = createSlate(layer, { x: station.x + 80, y: station.y + station.h - 30 }, SHOW_MS);
  const truck = createFireTruck(layer, text.paint.truck, toRight);

  const frame = failedDeployFrame(stage, event, {
    near: { x: station.x + 190, y: station.y - 80 },
    cast: null,
    show: SHOW_MS,
  });

  const show = runTimeline(
    host.clock,
    host.reducedMotion,
    {
      duration: SHOW_MS,
      still: STILL_MS,
      draw(elapsed) {
        slate.draw(elapsed);
        const race = EASE.in(
          keyframe(elapsed, [
            [RACE.from, 0],
            [RACE.to, 1],
          ]),
        );
        truck.place(lerp(station.x + 20, exit, race), feet, 'blinking', elapsed);
      },
    },
    () => layer.remove(),
  );

  return () => {
    show();
    frame();
    layer.remove();
  };
}
