import type { Rect } from '@deskorama/core';
import { drawBig } from './draw-big.ts';
import { drawProp } from './draw-prop.ts';
import { drawText } from './draw-text.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { rowsWidth } from './rows-width.ts';
import { stageFor } from './stage-for.ts';
import { stageSizes } from './stage-sizes.ts';
import { tagRows } from './tag-rows.ts';
import { textWidth } from './text-width.ts';

const DURATION = 3000;
const ARRIVED = 900;
const RAISED = 1200;
const KEY_T = 1800;

/**
 * partner: someone important joins, from the other side or a bigger account. A red carpet rolls out, a guest in a
 * top hat strolls onto it and raises a placard with the Event's tag, then strolls on; the neighbours cheer. Key pose:
 * the guest on the carpet, placard up.
 * @example
 * director.play(partnerEvent); // through gagFor(event) === playRedCarpet
 */
export const playRedCarpet: Gag = (event, env) => {
  const rows = tagRows(event.meta.tag, 39, 2) ?? [];
  const staged = stageFor(env, event, {
    duration: DURATION,
    sizes: stageSizes('notable', 14 + Math.max(14, rowsWidth(rows) + 6)),
  });
  if (staged === null) return null;

  return {
    duration: DURATION,
    keyT: KEY_T,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'red-carpet',
    cue: { at: 0, run: (now) => env.cheerNear(staged.spot, now + 1800) },
    draw(ctx, t) {
      drawGuest(ctx, staged.box, rows, t);
    },
  };
};

/**
 * Draws one moment: the carpet unrolling, the guest walking onto it, the placard raised, the guest walking on.
 * @example
 * drawGuest(ctx, { x: 60, y: 165, w: 45, h: 30 }, ['VIP'], 1800);
 */
function drawGuest(ctx: CanvasRenderingContext2D, box: Rect, rows: readonly string[], t: number): void {
  const ground = box.y + box.h - 1;
  const carpet = Math.min(box.w, frameAt(t, 12));
  paint(ctx, box.x, ground - 1, carpet, 2, PAL.accent);
  paint(ctx, box.x, ground, carpet, 1, PAL.wood);

  const walkOut = t > DURATION - 700 ? (t - (DURATION - 700)) / 700 : 0;
  const x = box.x - 10 + Math.round(Math.min(1, t / ARRIVED) * 13) + Math.round(walkOut * (box.w + 4));
  drawBig(ctx, { name: 'VIP' }, x, ground - 1);
  if (t < RAISED || walkOut > 0) return;

  const w = Math.max(14, rowsWidth(rows) + 6);
  const h = 6 + Math.max(1, rows.length) * 7;
  const left = Math.max(box.x, Math.min(x + 12, box.x + box.w - w));
  const top = box.y + 1;

  paint(ctx, x + 11, top + h, 1, Math.max(0, ground - 14 - top - h), PAL.wood);
  paint(ctx, left, top, w, h, PAL.ink);
  paint(ctx, left + 1, top + 1, w - 2, h - 2, PAL.paper);
  if (rows.length === 0) paint(ctx, left + Math.floor(w / 2) - 2, top + 4, 4, 4, PAL.accent);
  rows.forEach((row, i) => drawText(ctx, row, left + Math.floor((w - textWidth(row)) / 2), top + 4 + i * 7, PAL.ink));

  if (t - RAISED < 300) drawProp(ctx, 'SPARK', x + 9, ground - 32);
}
