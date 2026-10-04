import { drawText } from './draw-text.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { stageFor } from './stage-for.ts';
import { stageSizes } from './stage-sizes.ts';
import { tagWord } from './tag-word.ts';
import { textWidth } from './text-width.ts';

const DURATION = 2200;
const KEY_T = 1000;

/**
 * abandon: something started and was given up. A manila folder labelled with the Event's tag drops into a green
 * recycling bin and sinks; the bin wobbles. Key pose: the folder going in.
 * @example
 * director.play(abandonEvent); // through gagFor(event) === playBinned
 */
export const playBinned: Gag = (event, env) => {
  const staged = stageFor(env, event, { duration: DURATION, sizes: stageSizes(event.rarity) });
  if (staged === null) return null;

  const label = tagWord(event, 26);
  const { box } = staged;
  const x = box.x + Math.floor((box.w - 30) / 2);
  const top = box.y + box.h - 30;

  return {
    duration: DURATION,
    keyT: KEY_T,
    blinkMs: 250,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'bin',
    draw(ctx, t) {
      let drop = 0;
      if (t >= 300 && t < KEY_T) drop = Math.round(((t - 300) / (KEY_T - 300)) * 3);
      else if (t >= KEY_T) drop = 3 + Math.min(14, frameAt(t - KEY_T, 40));
      drawFolder(ctx, x, top + drop, label);
      drawBin(ctx, x, top + 17, t > KEY_T + 500 && frameAt(t, 80, 2) === 1);
    },
  };
};

/**
 * Draws a manila folder, 30 x 13, with its tab and its label, or grey lines when there is none.
 * @example
 * drawFolder(ctx, 135, 173, 'FERMÉE');
 */
function drawFolder(ctx: CanvasRenderingContext2D, x: number, y: number, label: string): void {
  paint(ctx, x + 1, y, 9, 3, PAL.ink);
  paint(ctx, x + 2, y + 1, 7, 2, PAL.lamp);
  paint(ctx, x, y + 2, 30, 11, PAL.ink);
  paint(ctx, x + 1, y + 3, 28, 9, PAL.glow);

  if (label !== '') drawText(ctx, label, x + Math.floor((30 - textWidth(label)) / 2), y + 6, PAL.ink);
  else for (let i = 0; i < 2; i += 1) paint(ctx, x + 4, y + 5 + i * 3, 20 - i * 6, 1, PAL.zinc);
}

/**
 * Draws the recycling bin: a yellow rim over a green body whose front hides whatever falls in.
 * @example
 * drawBin(ctx, 135, 182, false);
 */
function drawBin(ctx: CanvasRenderingContext2D, x: number, y: number, wobble: boolean): void {
  const dx = wobble ? 1 : 0;

  paint(ctx, x + dx, y, 30, 3, PAL.ink);
  paint(ctx, x + 1 + dx, y + 1, 28, 1, PAL.lamp);
  paint(ctx, x + 2 + dx, y + 3, 26, 10, PAL.ink);
  paint(ctx, x + 3 + dx, y + 3, 24, 9, PAL.moss);
  for (const sx of [8, 14, 20]) paint(ctx, x + sx + dx, y + 5, 2, 6, PAL.leaf);
}
