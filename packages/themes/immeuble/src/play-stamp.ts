import type { Rect } from '@deskorama/core';
import { drawText } from './draw-text.ts';
import type { Gag } from './gag.ts';
import { rowY } from './row-y.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { plainText } from './plain-text.ts';
import { puff } from './puff.ts';
import { stageFor } from './stage-for.ts';
import { textWidth } from './text-width.ts';

const DURATION = 2600;
const IMPACT = 240;
const KEY_T = 1200;

/**
 * approval: something is approved or done right. A giant rubber stamp slams the Event's tag ("MERGÉE", or the
 * building's "VU") in vermilion onto a sheet, the picture jolts and the nearby tenants jump. Only approval owns the
 * stamp. Key pose: the inked mark under the lifted stamp.
 * @example
 * director.play(approvalEvent); // through gagFor(event) === playStamp
 */
export const playStamp: Gag = (event, env) => {
  const staged = stageFor(env, event, {
    duration: DURATION,
    sizes: [
      [240, 120],
      [180, 120],
    ],
    near: { x: env.layout.width * 0.39, y: rowY(env.layout, 11) },
  });
  if (staged === null) return null;

  const { box, spot } = staged;
  const word = plainText(event.meta.tag === '' ? env.copy.text.props.ok : event.meta.tag);

  return {
    duration: DURATION,
    keyT: KEY_T,
    stage: spot,
    plaque: staged.plaque,
    prop: 'stamp',
    cue: {
      at: IMPACT,
      run(now) {
        env.shake(1, 260);
        env.cheerNear(spot, now + 1600);
      },
    },
    draw(ctx, t) {
      drawSheet(ctx, box, word, t >= IMPACT);
      drawStamp(ctx, box, t);
    },
  };
};

/**
 * Draws the sheet with its grey lines and, once stamped, the vermilion mark; a long word shows worn rubber, a
 * short one stays whole so it still reads.
 * @example
 * drawSheet(ctx, { x: 225, y: 180, w: 60, h: 30 }, 'MERGÉE', true);
 */
function drawSheet(ctx: CanvasRenderingContext2D, box: Rect, word: string, inked: boolean): void {
  const scale = textWidth(word, 2) + 8 <= box.w ? 2 : 1;
  const w = Math.min(textWidth(word, scale), box.w - 10);
  const x = box.x + Math.floor((box.w - w) / 2);
  const y = box.y + 14;

  paint(ctx, box.x, y - 14, box.w, 30, PAL.ink);
  paint(ctx, box.x + 1, y - 13, box.w - 2, 28, PAL.paper);
  for (let i = 0; i < 3; i += 1) paint(ctx, box.x + 4, y - 10 + i * 3, box.w - 12 - (i % 2) * 10, 1, PAL.zinc);
  if (!inked) return;

  paint(ctx, x - 4, y - 11, w + 8, 1, PAL.accent);
  paint(ctx, x - 4, y + 12, w + 8, 1, PAL.accent);
  paint(ctx, x - 4, y - 11, 1, 24, PAL.accent);
  paint(ctx, x + w + 3, y - 11, 1, 24, PAL.accent);
  drawText(ctx, word, x, scale === 2 ? y : y + 3, PAL.accent, scale);
  if (w < 30) return;
  for (let i = 0; i < 9; i += 1) paint(ctx, x + ((i * 17) % w), y + ((i * 7) % 10), 1, 1, PAL.paper);
}

/**
 * Draws the stamp itself as it drops, presses with two puffs, then lifts out of the picture.
 * @example
 * drawStamp(ctx, box, 300);
 */
function drawStamp(ctx: CanvasRenderingContext2D, box: Rect, t: number): void {
  let offset: number;
  if (t < IMPACT) offset = [-30, -18, -8][Math.min(2, Math.floor(t / 80))] ?? 0;
  else if (t < 520) offset = 0;
  else if (t < 760) offset = [-6, -16, -28][Math.min(2, Math.floor((t - 520) / 80))] ?? 0;
  else return;

  const half = Math.min(27, Math.floor(box.w / 2) - 2);
  const cx = box.x + Math.floor(box.w / 2);
  const bottom = box.y + 25 + offset;

  paint(ctx, cx - half, bottom - 4, half * 2, 4, PAL.ink);
  paint(ctx, cx - half + 1, bottom - 4, half * 2 - 2, 2, PAL.umber);
  paint(ctx, cx - half + 1, bottom - 2, half * 2 - 2, 2, PAL.accent);
  paint(ctx, cx - 3, bottom - 13, 6, 9, PAL.ink);
  paint(ctx, cx - 2, bottom - 13, 4, 9, PAL.wood);
  paint(ctx, cx - 6, bottom - 19, 12, 6, PAL.ink);
  paint(ctx, cx - 5, bottom - 18, 10, 4, PAL.wood);
  if (offset !== 0) return;

  puff(ctx, cx - half - 1, bottom - 1, 2);
  puff(ctx, cx + half + 1, bottom - 1, 2);
}
