import type { Rect } from '@deskorama/core';
import { drawBig } from './draw-big.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { lookOf } from './look-of.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { stageFor } from './stage-for.ts';
import { stageSizes } from './stage-sizes.ts';

const DURATION = 3000;
const START = 500;
const KEY_T = 1500;
const DONE = 2300;

/**
 * departure: something or someone leaves, an account as well as a branch. A figure stands on the stage and a big
 * pink eraser rubs it out from the head down, crumbs falling, until nothing is left: no one carries a box out.
 * Key pose: the figure half rubbed out under the eraser.
 * @example
 * director.play(departureEvent); // through gagFor(event) === playEraser
 */
export const playEraser: Gag = (event, env) => {
  const staged = stageFor(env, event, { duration: DURATION, sizes: stageSizes(event.rarity) });
  if (staged === null) return null;

  const look = 23 + lookOf(event.id);

  return {
    duration: DURATION,
    keyT: KEY_T,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'eraser',
    draw(ctx, t) {
      drawErasure(ctx, staged.box, look, t);
    },
  };
};

/**
 * Draws one moment: what is left of the figure, the eraser scrubbing at the line, the crumbs on the floor.
 * @example
 * drawErasure(ctx, { x: 60, y: 165, w: 45, h: 30 }, 23, 1500);
 */
function drawErasure(ctx: CanvasRenderingContext2D, box: Rect, look: number, t: number): void {
  const ground = box.y + box.h - 1;
  const top = ground - 19;
  const k = Math.max(0, Math.min(1, (t - START) / (DONE - START)));
  const line = top + Math.round(k * 21);
  const fx = box.x + Math.floor(box.w / 2) - 5;

  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, line, box.w, ground + 1 - line);
  ctx.clip();
  drawBig(ctx, { look, pose: 'FRONT' }, fx, ground);
  ctx.restore();

  for (let i = 0; i < Math.floor(k * 9); i += 1) paint(ctx, fx - 4 + ((i * 7) % 18), ground - (i % 2), 1, 1, PAL.dawn);
  if (t < START - 300 || t > DONE + 400) return;

  const scrub = [0, 3, 6, 3, 0, -3, -6, -3][frameAt(t, 60, 8)] ?? 0;
  const ex = fx - 4 + scrub;
  const ey = Math.min(line, ground - 2) - 8;
  paint(ctx, ex, ey, 18, 9, PAL.ink);
  paint(ctx, ex + 1, ey + 1, 16, 7, PAL.dawn);
  paint(ctx, ex + 8, ey + 1, 9, 7, PAL.denim);
  paint(ctx, ex + 9, ey + 3, 7, 1, PAL.haze);
  paint(ctx, ex + 1, ey + 1, 7, 1, PAL.glow);
}
