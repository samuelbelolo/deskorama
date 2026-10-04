import { drawOutlinedText } from './draw-outlined-text.ts';
import { drawProp } from './draw-prop.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { stageFor } from './stage-for.ts';
import { tagWord } from './tag-word.ts';

const DURATION = 2400;
const FILLED = 1100;
const KEY_T = 1500;

/**
 * money, second picture: money comes in. Coins drop one after another into a big piggy bank, it gives a happy hop
 * and the Event's tag pops up over it like a score. Key pose: the amount over the pig.
 * @example
 * playPiggyBank(moneyEvent, env);
 */
export const playPiggyBank: Gag = (event, env) => {
  const tag = tagWord(event, 40);
  const staged = stageFor(env, event, { duration: DURATION, sizes: [[180, 120]] });
  if (staged === null) return null;

  const { box } = staged;
  const x = box.x + Math.floor((box.w - 24) / 2);
  const ground = box.y + box.h - 1;

  return {
    duration: DURATION,
    keyT: KEY_T,
    blinkMs: 250,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'piggy-bank',
    draw(ctx, t) {
      const hop = t >= FILLED && t < FILLED + 300 ? 2 : 0;
      const top = ground - 16 - hop;
      drawPig(ctx, x, top);

      for (let i = 0; i < 3; i += 1) {
        const from = 200 + i * 280;
        const y = box.y + frameAt(t - from, 25);
        if (t >= from && y + 8 <= top + 4) drawProp(ctx, 'COIN', x + 10, y, 2);
      }

      if (t >= FILLED && tag !== '')
        drawOutlinedText(
          ctx,
          tag,
          x + 12,
          Math.max(box.y + 2, ground - 26 - Math.min(4, frameAt(t - FILLED, 60))),
          PAL.glow,
        );
    },
  };
};

/**
 * Draws the piggy bank, 24 x 16, facing left: pink body, snout, ear, eye, legs, tail and the coin slot on top.
 * @example
 * drawPig(ctx, 70, 178);
 */
function drawPig(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  paint(ctx, x + 6, y + 1, 3, 2, PAL.ink);
  paint(ctx, x + 4, y + 2, 16, 1, PAL.ink);
  paint(ctx, x + 2, y + 3, 20, 10, PAL.ink);
  paint(ctx, x + 4, y + 13, 16, 1, PAL.ink);
  paint(ctx, x + 3, y + 4, 18, 8, PAL.dawn);
  paint(ctx, x + 4, y + 3, 16, 10, PAL.dawn);
  paint(ctx, x + 7, y + 2, 1, 1, PAL.dawn);
  paint(ctx, x + 5, y + 4, 12, 1, PAL.glow);
  paint(ctx, x, y + 6, 3, 4, PAL.ink);
  paint(ctx, x + 1, y + 7, 2, 2, PAL.dawn);
  paint(ctx, x + 1, y + 7, 1, 1, PAL.ink);
  paint(ctx, x + 6, y + 6, 1, 1, PAL.ink);
  paint(ctx, x + 11, y + 3, 5, 1, PAL.ink);
  paint(ctx, x + 22, y + 5, 1, 2, PAL.ink);
  paint(ctx, x + 23, y + 4, 1, 1, PAL.ink);
  for (const lx of [5, 16]) paint(ctx, x + lx, y + 14, 3, 2, PAL.ink);
}
