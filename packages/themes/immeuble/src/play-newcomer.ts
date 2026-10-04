import type { Rect } from '@deskorama/core';
import { drawBig } from './draw-big.ts';
import { DOOR_W, drawDoor } from './draw-door.ts';
import { drawText } from './draw-text.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { lookOf } from './look-of.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { stageFor } from './stage-for.ts';
import { stageSizes } from './stage-sizes.ts';
import { tagWord } from './tag-word.ts';
import { textWidth } from './text-width.ts';

const DURATION = 2800;
const ARRIVED = 1000;
const KEY_T = 1400;

/**
 * arrival, first picture: someone or something new comes in. A newcomer walks up to our door pulling a vermilion
 * suitcase lettered with the Event's tag, waits, the door opens and they step in. Key pose: the newcomer at the
 * closed door with the suitcase.
 * @example
 * playNewcomer(arrivalEvent, env);
 */
export const playNewcomer: Gag = (event, env) => {
  const tag = tagWord(event, 30);
  const caseW = Math.max(12, textWidth(tag) + 4);
  const staged = stageFor(env, event, { duration: DURATION, sizes: stageSizes('notable', DOOR_W + 12 + caseW) });
  if (staged === null) return null;

  const look = 31 + lookOf(event.id);

  return {
    duration: DURATION,
    keyT: KEY_T,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'suitcase',
    draw(ctx, t) {
      drawArrival(ctx, staged.box, { look, tag, caseW }, t);
    },
  };
};

/**
 * Draws one moment: the newcomer walking in from the right with the suitcase, waiting at the door, going in.
 * @example
 * drawArrival(ctx, { x: 60, y: 165, w: 45, h: 30 }, { look: 31, tag: '#12', caseW: 18 }, 1400);
 */
function drawArrival(
  ctx: CanvasRenderingContext2D,
  box: Rect,
  who: { readonly look: number; readonly tag: string; readonly caseW: number },
  t: number,
): void {
  const ground = box.y + box.h - 1;
  const open = t > KEY_T + 400;
  drawDoor(ctx, box.x, ground, open);

  const stop = box.x + DOOR_W + 1;
  const start = box.x + box.w - 10;
  const into = open ? Math.min(1, (t - KEY_T - 600) / 500) : 0;
  const x = Math.round(start - (start - stop) * Math.min(1, t / ARRIVED) - into * 12);
  if (into >= 1) return;

  const walking = t < ARRIVED || into > 0;
  drawBig(
    ctx,
    { look: who.look, pose: walking ? (frameAt(t, 160) % 2 === 1 ? 'WALK_A' : 'WALK_B') : 'FRONT' },
    x,
    ground,
    { flip: true },
  );
  drawSuitcase(ctx, Math.min(x + 11, box.x + box.w - who.caseW), ground, who.tag, who.caseW);
}

/**
 * Draws the suitcase rolling behind the newcomer: a handle, a vermilion case, the tag lettered in paper.
 * @example
 * drawSuitcase(ctx, 84, 194, '#12', 18);
 */
function drawSuitcase(ctx: CanvasRenderingContext2D, x: number, ground: number, tag: string, w: number): void {
  paint(ctx, x, ground - 15, 1, 5, PAL.ink);
  paint(ctx, x, ground - 15, 3, 1, PAL.ink);
  paint(ctx, x, ground - 11, w, 10, PAL.ink);
  paint(ctx, x + 1, ground - 10, w - 2, 8, PAL.accent);
  if (tag !== '') drawText(ctx, tag, x + Math.floor((w - textWidth(tag)) / 2), ground - 8, PAL.paper);
  paint(ctx, x + 1, ground - 1, 2, 1, PAL.ink);
  paint(ctx, x + w - 3, ground - 1, 2, 1, PAL.ink);
}
