import type { Cancel, WallpaperEvent } from '@deskorama/core';
import type { Mirror } from './create-mirror.ts';
import type { Plaques } from './create-plaques.ts';
import { createRepertoire } from './create-repertoire.ts';
import { createWaitingLine } from './create-waiting-line.ts';
import type { Act, GagEnv } from './gag.ts';
import { paced } from './paced.ts';
import { roleOf } from './role-of.ts';
import { frameAt } from './frame-at.ts';
import { gagSpan, plaqueSpan } from './timing.ts';
import { toNative } from './to-native.ts';

/** Does nothing: what an absent cue stops. */
const noop = (): void => {};

/** Plays the Gags of one screen. */
export interface Director {
  /** Plays an Event's Gag now if it finds room, or keeps it waiting. */
  play(event: WallpaperEvent): void;
  /** Looks for room for the waiting Events again: the windows moved. */
  retry(): void;
  draw(ctx: CanvasRenderingContext2D, now: number): void;
  busy(): boolean;
  /** Stops every Gag, gives their rooms back and forgets the waiting Events. */
  dispose(): void;
}

/** A Gag playing: its act, when it started, and what stops it early. */
interface Playing {
  readonly act: Act;
  readonly start: number;
  readonly stop: Cancel;
}

/**
 * Returns the director of one screen. Gags play side by side, each in its own held room with its plaque, each drawn
 * clipped to that room, so nothing of it shows outside visible space. An Event that finds no room waits in line. A
 * Gag ends after its action and its key pose's hold, mirrored meanwhile as `data-gag`, blinking out at the end when
 * it asks to and playing its cue once on the Clock; its plaque stays 2.5 s more.
 * @example
 * const director = createDirector({ env, mirror, plaques });
 * host.onEvent((event) => director.play(event));
 */
export function createDirector(stage: {
  readonly env: GagEnv;
  readonly mirror: Mirror;
  readonly plaques: Plaques;
}): Director {
  const { env, mirror, plaques } = stage;
  const { clock } = env.host;
  const gagFor = createRepertoire();
  const playing = new Set<Playing>();
  let serial = 0;

  const start = (event: WallpaperEvent): boolean => {
    const act = gagFor(event)(event, env);
    if (act === null) return false;

    serial += 1;
    const now = clock.now();
    const unmirror = mirror.set(`gag-${serial}`, { box: act.stage, data: { gag: roleOf(event), prop: act.prop } });
    const unplaque = plaques.add(act.plaque, event, now + plaqueSpan(act.duration));
    const { cue } = act;
    const cued = cue === undefined ? null : clock.after(cue.at, () => cue.run(clock.now()));
    const end = clock.after(gagSpan(act.duration), () => {
      playing.delete(entry);
      unmirror();
      waiting.retry();
    });
    const entry: Playing = {
      act,
      start: now,
      stop: () => [end, cued ?? noop, unmirror, unplaque, () => act.stage.release()].forEach((stop) => stop()),
    };

    playing.add(entry);
    return true;
  };

  const waiting = createWaitingLine(clock, start);

  return {
    play(event) {
      if (!start(event)) waiting.add(event);
    },
    retry: () => waiting.retry(),
    draw(ctx, now) {
      for (const { act, start: from } of playing) {
        const t = env.host.reducedMotion ? act.keyT : paced(now - from, act.keyT);
        const blinking = act.blinkMs !== undefined && t > act.duration - act.blinkMs && frameAt(t, 100, 2) === 1;
        if (!blinking || env.host.reducedMotion) drawClipped(ctx, act, t, now);
      }
    },
    busy: () => playing.size > 0,
    dispose() {
      waiting.dispose();
      for (const entry of Array.from(playing)) entry.stop();
      playing.clear();
    },
  };
}

/**
 * Draws a Gag at `t` of its own timeline, clipped to its held room.
 * @example
 * drawClipped(ctx, act, 1200, now);
 */
function drawClipped(ctx: CanvasRenderingContext2D, act: Act, t: number, now: number): void {
  const box = toNative(act.stage);

  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  act.draw(ctx, t, now);
  ctx.restore();
}
