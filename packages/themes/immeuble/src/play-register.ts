import { drawProp } from './draw-prop.ts';
import { drawText } from './draw-text.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { stageFor } from './stage-for.ts';
import { stageSizes } from './stage-sizes.ts';
import { tagWord } from './tag-word.ts';
import { textWidth } from './text-width.ts';

const DURATION = 2400;
const RUNG = 500;
const KEY_T = 1400;

/**
 * money, first picture: money comes in. A cash register rings up the Event's tag on its display, its drawer springs
 * open on banknotes and coins drop in. Key pose: the amount on the display over the open drawer.
 * @example
 * playRegister(moneyEvent, env);
 */
export const playRegister: Gag = (event, env) => {
  const tag = tagWord(event, 34);
  const w = Math.max(26, textWidth(tag) + 8);
  const staged = stageFor(env, event, { duration: DURATION, sizes: stageSizes(event.rarity, w + 9) });
  if (staged === null) return null;

  const { box } = staged;
  const x = box.x + Math.max(0, Math.floor((box.w - w - 8) / 2));
  const y = box.y + box.h - 30;

  return {
    duration: DURATION,
    keyT: KEY_T,
    blinkMs: 250,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'register',
    draw(ctx, t) {
      drawRegister(ctx, { x, y, w, tag }, t);
      drawCoins(ctx, x + w + 1, y, t);
    },
  };
};

/**
 * Draws the register: its display on a stalk (dashes, then the amount), the keyed body, the drawer sliding open.
 * @example
 * drawRegister(ctx, { x: 136, y: 166, w: 30, tag: '+129 €' }, 1400);
 */
function drawRegister(
  ctx: CanvasRenderingContext2D,
  at: { readonly x: number; readonly y: number; readonly w: number; readonly tag: string },
  t: number,
): void {
  const { x, y, w, tag } = at;

  paint(ctx, x + 2, y, w - 4, 9, PAL.ink);
  paint(ctx, x + 3, y + 1, w - 6, 7, PAL.night);
  if (t >= RUNG && tag !== '') drawText(ctx, tag, x + Math.floor((w - textWidth(tag)) / 2), y + 2, PAL.leaf);
  else for (let i = 0; i < 3; i += 1) paint(ctx, x + Math.floor(w / 2) - 5 + i * 4, y + 4, 2, 1, PAL.leaf);

  paint(ctx, x + Math.floor(w / 2) - 1, y + 9, 2, 3, PAL.ink);
  paint(ctx, x, y + 12, w, 11, PAL.ink);
  paint(ctx, x + 1, y + 13, w - 2, 9, PAL.umber);
  paint(ctx, x + 1, y + 13, w - 2, 1, PAL.lamp);
  for (let i = 0; i < 8; i += 1) {
    const lit = i === frameAt(t, 60, 8) && t < RUNG;
    paint(ctx, x + 3 + (i % 4) * 4, y + 14 + Math.floor(i / 4) * 3, 3, 2, lit ? PAL.lamp : PAL.paper);
  }

  const open = t < RUNG ? 0 : Math.min(6, frameAt(t - RUNG, 30));
  paint(ctx, x + open, y + 23, w, 6, PAL.ink);
  paint(ctx, x + 1 + open, y + 24, w - 2, 4, PAL.lamp);
  paint(ctx, x + 3 + open, y + 25, w - 6, 2, PAL.wood);
  if (open > 3)
    for (let i = 0; i < 3; i += 1)
      paint(ctx, x + 4 + open + i * 6, y + 21 + (i % 2), 5, 4, i % 2 === 1 ? PAL.moss : PAL.leaf);
}

/**
 * Draws three coins dropping into the open drawer one after another, each sparkling as it lands.
 * @example
 * drawCoins(ctx, 168, 166, 1400);
 */
function drawCoins(ctx: CanvasRenderingContext2D, x: number, y: number, t: number): void {
  for (let i = 0; i < 3; i += 1) {
    const from = RUNG + 150 + i * 220;
    if (t < from || t > KEY_T + 400) continue;

    const fall = Math.min(18, frameAt(t - from, 20));
    drawProp(ctx, 'COIN', x - 6 + i * 2, y + 4 + fall, 2);
    if (fall === 18 && frameAt(t, 120, 2) === 1) drawProp(ctx, 'SPARK', x - 2 + i * 2, y + 19);
  }
}
