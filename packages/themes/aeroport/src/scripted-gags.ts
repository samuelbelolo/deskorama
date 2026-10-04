import { onFrameAtMost, type Cancel, type WallpaperEvent } from '@deskorama/core';
import { CAPTION_HOLD_MS, CAPTION_ROOM } from './caption-room.ts';
import { findRoom, type Room, type RoomRequest } from './find-room.ts';
import type { GagScript } from './gag-script.ts';
import { REDRAW_FPS } from './redraw-rate.ts';
import type { Gag, Stage } from './stage.ts';
import { ROOM_WAIT_MS, waitForRoom } from './wait-for-room.ts';

/**
 * Returns a Gag that plays the first of several scripts that finds room (a picture in the sky, else one on the
 * runway): it waits for room, holds it for the Gag and its Caption's late glance, sets the stage, hangs the Caption
 * at the top of the room, and draws the actors from the Clock at most {@link REDRAW_FPS} times per second, or holds
 * the key pose still with reduced motion.
 * @example
 * const playGolden: Gag = scriptedGags([SKY_SCRIPT, RUNWAY_SCRIPT]);
 */
export function scriptedGags(all: readonly GagScript[]): Gag {
  const patience = Math.max(...all.map((script) => script.patience ?? ROOM_WAIT_MS));

  return (stage, event, done) =>
    waitForRoom(
      stage.host.clock,
      () => castFor(stage, event, all),
      ({ script, room }) => play(stage, event, room, { script, done }),
      done,
      patience,
    );
}

/**
 * Returns the first script with a room that fits one of its requests, and that room, held until its Caption is gone.
 * @example
 * castFor(stage, event, [sky, runway]); // { script: runway, room: { spot, top, floor } } when the sky is covered
 */
function castFor(
  stage: Stage,
  event: WallpaperEvent,
  scripts: readonly GagScript[],
): { script: GagScript; room: Room } | null {
  for (const script of scripts) {
    const asked = script.room(stage, event);
    const requests: readonly RoomRequest[] = Array.isArray(asked) ? asked : [asked];
    const hold = script.duration + CAPTION_HOLD_MS;

    for (const request of requests) {
      const room = findRoom(stage, request, hold);
      if (room !== null) return { script, room };
    }
  }

  return null;
}

/**
 * Plays a script in its held room; returns what stops it early and gives the room back.
 * @example
 * const stop = play(stage, event, room, { script, done: next });
 */
function play(stage: Stage, event: WallpaperEvent, room: Room, run: { script: GagScript; done: () => void }): Cancel {
  const { host } = stage;
  const { script, done } = run;

  const layer = document.createElement('div');
  layer.className = 'aeroport-gag';
  stage.root.append(layer);
  const scene = script.build(stage, event, room, layer);
  const start = host.clock.now();

  const bounds = { x: room.spot.x, y: room.spot.y, w: room.spot.w, h: CAPTION_ROOM };
  const anchor = { x: scene.captionX, y: room.top };
  stage.captions.show(event, anchor, start + script.duration + CAPTION_HOLD_MS, bounds);

  let stopDrawing: Cancel | null = null;
  if (host.reducedMotion) scene.draw(script.keyPose);
  else {
    scene.draw(0);
    stopDrawing = onFrameAtMost(host.clock, REDRAW_FPS, (now) => scene.draw(now - start));
  }

  const stop = (): void => {
    stopDrawing?.();
    ending();
    layer.remove();
  };

  const ending = host.clock.after(script.duration, () => {
    stop();
    done();
  });

  return () => {
    stop();
    room.spot.release();
  };
}
