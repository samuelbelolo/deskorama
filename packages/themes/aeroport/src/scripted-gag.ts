import { onFrameAtMost, type Cancel, type WallpaperEvent } from '@deskorama/core';
import { CAPTION_HOLD_MS, CAPTION_ROOM } from './caption-room.ts';
import { findRoom, type Room, type RoomRequest } from './find-room.ts';
import { REDRAW_FPS } from './redraw-rate.ts';
import type { Gag, Stage } from './stage.ts';
import { waitForRoom } from './wait-for-room.ts';

/** A Gag's actors on stage: how to draw them at any instant, and where the Caption points. */
interface GagScene {
  /** Draws every actor at `elapsed` ms into the Gag: a pure function of time, so any frame can be drawn alone. */
  readonly draw: (elapsed: number) => void;
  /** The horizontal centre of the Caption, over the actor it is about. */
  readonly captionX: number;
}

/** One Gag written as a script: how long it plays, its key pose, the room it asks for and how it sets its stage. */
export interface GagScript {
  readonly duration: number;
  /** The instant that tells the story alone; with reduced motion the Gag holds it from start to end. */
  readonly keyPose: number;
  /** The room the Gag needs, or several sizes of it, tried in order. */
  readonly room: (stage: Stage, event: WallpaperEvent) => RoomRequest | readonly RoomRequest[];
  /** Sets the actors into `layer`, a fresh layer of the root that is removed with them when the Gag ends. */
  readonly build: (stage: Stage, event: WallpaperEvent, room: Room, layer: HTMLElement) => GagScene;
}

/**
 * Returns a Gag that plays a script: it waits for room, holds it for the Gag and its Caption's late glance, sets
 * the stage, hangs the Caption at the top of the room, and draws the actors from the Clock at most
 * {@link REDRAW_FPS} times per second, or holds the key pose still with reduced motion.
 * @example
 * const playStamp: Gag = scriptedGag(STAMP_SCRIPT);
 */
export function scriptedGag(script: GagScript): Gag {
  return (stage, event, done) =>
    waitForRoom(
      stage.host.clock,
      () => roomFor(stage, event, script),
      (room) => play(stage, event, room, { script, done }),
      done,
    );
}

/**
 * Returns the first room that fits one of the script's requests, held until its Caption is gone.
 * @example
 * roomFor(stage, event, script); // { spot, top, floor } or null
 */
function roomFor(stage: Stage, event: WallpaperEvent, script: GagScript): Room | null {
  const asked = script.room(stage, event);
  const requests: readonly RoomRequest[] = Array.isArray(asked) ? asked : [asked];
  const hold = script.duration + CAPTION_HOLD_MS;

  for (const request of requests) {
    const room = findRoom(stage, request, hold);
    if (room !== null) return room;
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
