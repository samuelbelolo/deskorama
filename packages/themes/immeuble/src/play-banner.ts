import type { Rect } from '@deskorama/core';
import { drawText } from './draw-text.ts';
import { findFlat } from './find-flat.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { rowsWidth } from './rows-width.ts';
import { stageFor } from './stage-for.ts';
import { stageSizes } from './stage-sizes.ts';
import { tagRows } from './tag-rows.ts';
import { textWidth } from './text-width.ts';
import { windowRect } from './window-rect.ts';

const DURATION = 3000;
const KEY_T = 1500;

/**
 * publish: something new goes live for others to see. Over a visible empty flat a vermilion banner unrolls with the
 * Event's tag; when no flat will do or the tag needs two rows, a vermilion board springs up on a post instead. Key
 * pose: the banner or the board unrolled.
 * @example
 * director.play(publishEvent); // through gagFor(event) === playBanner
 */
export const playBanner: Gag = (event, env) => {
  const lines = tagRows(event.meta.tag, 38, 2) ?? [];
  const flat = lines.length === 1 ? findFlat(env, event, DURATION) : null;
  if (flat !== null) {
    const win = windowRect(flat.room);
    return {
      duration: DURATION,
      keyT: KEY_T,
      stage: flat.spot,
      plaque: flat.plaque,
      prop: 'banner',
      draw: (ctx, t) => drawBanner(ctx, win, lines.join(' '), t),
    };
  }

  const w = Math.max(26, rowsWidth(lines) + 6);
  const staged = stageFor(env, event, { duration: DURATION, sizes: stageSizes('notable', w + 4) });
  if (staged === null) return null;

  return {
    duration: DURATION,
    keyT: KEY_T,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'board',
    blinkMs: 250,
    draw: (ctx, t) => drawBoard(ctx, staged.box, lines, t),
  };
};

/**
 * Draws the banner unrolling down over a window, the tag on it once it is open.
 * @example
 * drawBanner(ctx, { x: 18, y: 80, w: 9, h: 13 }, 'V3.0', 1500);
 */
function drawBanner(ctx: CanvasRenderingContext2D, win: Rect, text: string, t: number): void {
  const w = textWidth(text) + 6;
  const x = win.x + Math.floor(win.w / 2) - Math.floor(w / 2);
  const y = win.y + 1;
  const open =
    t < DURATION - 400 ? Math.min(12, 1 + frameAt(t, 45)) : Math.max(1, 12 - frameAt(t - DURATION + 400, 40));

  paint(ctx, x - 1, y - 2, w + 2, 2, PAL.ink);
  paint(ctx, x, y, w, open, PAL.accent);
  paint(ctx, x, y + open - 1, w, 1, PAL.ink);
  if (open === 12) drawText(ctx, text, x + 3, y + 4, PAL.paper);
}

/**
 * Draws the board: a post driven in, then the vermilion panel with the tag on one or two rows.
 * @example
 * drawBoard(ctx, { x: 135, y: 165, w: 45, h: 30 }, ['NOUVEAU'], 1500);
 */
function drawBoard(ctx: CanvasRenderingContext2D, box: Rect, lines: readonly string[], t: number): void {
  const ground = box.y + box.h - 1;
  const rise = Math.max(0, 10 - frameAt(t, 30));
  const top = box.y + 1 + rise;
  const w = Math.max(26, rowsWidth(lines) + 6);
  const left = box.x + Math.floor((box.w - w) / 2);
  const mid = left + Math.floor(w / 2);

  paint(ctx, mid - 1, top + 16, 2, ground - top - 15, PAL.wood);
  paint(ctx, left, top, w, 18, PAL.ink);
  paint(ctx, left + 1, top + 1, w - 2, 16, PAL.accent);
  const first = top + (lines.length > 1 ? 4 : 7);
  lines.forEach((line, i) => drawText(ctx, line, mid - Math.floor(textWidth(line) / 2), first + i * 8, PAL.paper));
  if (rise === 0 && t < 700) paint(ctx, mid - 5, ground, 10, 1, PAL.stone2);
}
