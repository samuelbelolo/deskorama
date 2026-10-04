import { drawText } from './draw-text.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { stageFor } from './stage-for.ts';
import { stageSizes } from './stage-sizes.ts';
import { tagWord } from './tag-word.ts';
import { textWidth } from './text-width.ts';

const DURATION = 2600;
const PRINTED = 1200;
const KEY_T = 1400;

/**
 * usage, first picture: someone used the product. A big office printer hums and pushes out a page with the Event's
 * tag printed on it in vermilion. Key pose: the page out of the printer.
 * @example
 * playPrinter(usageEvent, env);
 */
export const playPrinter: Gag = (event, env) => {
  const word = tagWord(event, 34);
  const pw = Math.max(14, textWidth(word) + 4);
  const staged = stageFor(env, event, { duration: DURATION, sizes: stageSizes(event.rarity, pw > 28 ? 30 : 0) });
  if (staged === null) return null;

  const { box } = staged;
  const x = box.x + Math.floor((box.w - 28) / 2);
  const base = box.y + box.h - 1;

  return {
    duration: DURATION,
    keyT: KEY_T,
    blinkMs: 250,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'printer',
    draw(ctx, t) {
      const k = Math.max(0, Math.min(1, (t - 300) / (PRINTED - 300)));
      drawPage(ctx, x + 14 - Math.floor(pw / 2), base - 11 - Math.round(k * 17), word, pw);
      drawPrinter(ctx, x, base - 11, t < PRINTED && frameAt(t, 90, 2) === 1);
    },
  };
};

/**
 * Draws the page: paper, the tag in vermilion at its top, grey lines of text under it.
 * @example
 * drawPage(ctx, 80, 166, 'CSV', 15);
 */
function drawPage(ctx: CanvasRenderingContext2D, x: number, y: number, word: string, w: number): void {
  paint(ctx, x, y, w, 18, PAL.ink);
  paint(ctx, x + 1, y + 1, w - 2, 17, PAL.paper);
  if (word !== '') drawText(ctx, word, x + Math.floor((w - textWidth(word)) / 2), y + 3, PAL.accent);
  for (let i = 0; i < 3; i += 1) paint(ctx, x + 3, y + 10 + i * 3, w - 6 - (i % 2) * 3, 1, PAL.zinc);
}

/**
 * Draws the printer, 28 x 12: a grey body, the paper slot, a green light, trembling while it prints.
 * @example
 * drawPrinter(ctx, 73, 183, true);
 */
function drawPrinter(ctx: CanvasRenderingContext2D, x: number, y: number, hum: boolean): void {
  const dx = hum ? 1 : 0;

  paint(ctx, x + dx, y, 28, 12, PAL.ink);
  paint(ctx, x + 1 + dx, y + 1, 26, 3, PAL.zinc);
  paint(ctx, x + 1 + dx, y + 4, 26, 7, PAL.slate);
  paint(ctx, x + 6 + dx, y + 1, 16, 1, PAL.ink);
  paint(ctx, x + 22 + dx, y + 6, 2, 2, PAL.leaf);
  paint(ctx, x + 4 + dx, y + 8, 14, 1, PAL.dusk);
}
