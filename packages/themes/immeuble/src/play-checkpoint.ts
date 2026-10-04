import type { Rect } from '@deskorama/core';
import { drawBig } from './draw-big.ts';
import { DOOR_W, drawDoor } from './draw-door.ts';
import { drawProp } from './draw-prop.ts';
import { drawText } from './draw-text.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { rowY } from './row-y.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { plainText } from './plain-text.ts';
import { stageFor } from './stage-for.ts';
import { tagWord } from './tag-word.ts';
import { textWidth } from './text-width.ts';

const DURATION = 3400;
const ARRIVED = 800;
const DROPPED = 1200;
const BUMPED = 1500;
const KEY_T = 2100;

/** The checkpoint's post with its sign, and its barrier arm, in native pixels. */
const POST_W = 17;
const ARM = 9;

/**
 * blocked: an intruder is stopped at our door, a bot, spam, a leaked secret. A robot holding up a sign with the
 * Event's tag rolls up to our checkpoint, a STOP sign by a striped barrier; the barrier drops, the robot bumps into
 * it, smokes and backs off. Our door stands by it when the stage is wide. Key pose: the smoking robot at the
 * lowered barrier. The hall's tally keeps the day's count, and no plaque ever covers it.
 * @example
 * director.play(blockedEvent); // through gagFor(event) === playCheckpoint
 */
export const playCheckpoint: Gag = (event, env) => {
  const staged = stageFor(env, event, {
    duration: DURATION,
    sizes: [
      [240, 120],
      [180, 120],
    ],
    near: { x: env.layout.width * 0.3, y: rowY(env.layout, 12) },
  });
  if (staged === null) return null;

  const stop = plainText(env.copy.text.props.stop);
  const sign = tagWord(event, 24);

  return {
    duration: DURATION,
    keyT: KEY_T,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'checkpoint',
    draw(ctx, t) {
      const { box } = staged;
      const door = box.w >= 60 ? DOOR_W + 1 : 0;
      const ground = box.y + box.h - 1;

      if (door > 0) drawDoor(ctx, box.x, ground, false);
      drawBarrier(ctx, box.x + door, ground, stop, t);
      drawRobot(ctx, box, { stop: box.x + door + POST_W + ARM, signFrom: box.x + door + POST_W + 1, sign, ground }, t);
    },
  };
};

/**
 * Draws the red STOP sign on its post and the striped arm that swings down in front of the intruder, outlined and
 * resting on a little post once down, so it reads as a gate.
 * @example
 * drawBarrier(ctx, 60, 194, 'STOP', 1500);
 */
function drawBarrier(ctx: CanvasRenderingContext2D, x: number, ground: number, stop: string, t: number): void {
  paint(ctx, x + 7, ground - 16, 2, 16, PAL.zinc);
  paint(ctx, x, ground - 29, POST_W, 13, PAL.ink);
  paint(ctx, x + 1, ground - 28, POST_W - 2, 11, PAL.accent);
  drawText(ctx, stop, x + Math.floor((POST_W - textWidth(stop)) / 2), ground - 25, PAL.paper);

  const down = t >= DROPPED;
  const armY = ground - 11;
  if (down) {
    paint(ctx, x + POST_W - 2, armY - 1, ARM + 2, 4, PAL.ink);
    paint(ctx, x + POST_W + ARM - 1, armY + 3, 1, 8, PAL.ink);
  }

  for (let i = 0; i < ARM; i += 1) {
    const colour = Math.floor(i / 3) % 2 === 1 ? PAL.paper : PAL.accent;
    if (down) paint(ctx, x + POST_W - 1 + i, armY, 1, 2, colour);
    else paint(ctx, x + POST_W - 1, armY - i, 2, 1, colour);
  }
}

/**
 * Draws the robot and its sign: rolling in from the right, bumping into the barrier, smoking, backing away.
 * @example
 * drawRobot(ctx, box, { stop: 86, signFrom: 78, sign: 'SPAM', ground: 194 }, 2100);
 */
function drawRobot(
  ctx: CanvasRenderingContext2D,
  box: Rect,
  at: { readonly stop: number; readonly signFrom: number; readonly sign: string; readonly ground: number },
  t: number,
): void {
  const enter = Math.min(1, t / ARRIVED);
  const bump = t >= BUMPED ? Math.min(4, frameAt(t - BUMPED, 40)) : 0;
  const leave = t > DURATION - 700 ? (t - (DURATION - 700)) / 700 : 0;
  const from = box.x + box.w + 2;
  const x = Math.round(from - (from - at.stop) * enter + bump + leave * 18);
  const smoking = t >= BUMPED + 100;

  drawBig(ctx, { name: smoking ? 'ROBOT_SMOKE' : 'ROBOT' }, x, at.ground);
  if (smoking && frameAt(t, 120, 2) === 1) drawProp(ctx, 'SPARK', x - 1, at.ground - 14);
  if (at.sign === '') return;

  const w = textWidth(at.sign) + 4;
  const sx = Math.max(at.signFrom, Math.min(box.x + box.w - w, x + 7 - Math.floor(w / 2)));
  paint(ctx, x + 7, at.ground - 22, 1, 4, PAL.ink);
  paint(ctx, sx, at.ground - 30, w, 9, PAL.ink);
  paint(ctx, sx + 1, at.ground - 29, w - 2, 7, PAL.paper);
  drawText(ctx, at.sign, sx + 2, at.ground - 28, PAL.accent);
}
