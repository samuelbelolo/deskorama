import type { Rect } from '@deskorama/core';
import { cardLayout, type CardLayout } from './card-layout.ts';
import { drawCard } from './draw-card.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { stageFor } from './stage-for.ts';
import { stageSizes } from './stage-sizes.ts';

const DURATION = 2400;
const KEY_T = 1100;

/**
 * rejection, second picture: something was turned down. A paper card with the Event's tag rises and two thin ink
 * strokes cross it out, the tag still legible under them; the card shakes. Ink, not vermilion: a request for
 * changes must not read as an alarm. Key pose: the crossed-out card.
 * @example
 * playCross(rejectionEvent, env);
 */
export const playCross: Gag = (event, env) => {
  const card = cardLayout(event.meta.tag);
  const staged = stageFor(env, event, { duration: DURATION, sizes: stageSizes(event.rarity, card.w + 4) });
  if (staged === null) return null;

  return {
    duration: DURATION,
    keyT: KEY_T,
    blinkMs: 250,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'cross',
    draw(ctx, t) {
      drawCrossed(ctx, staged.box, card, t);
    },
  };
};

/**
 * Draws the card in the middle of the stage and the two strokes crossing it out.
 * @example
 * drawCrossed(ctx, { x: 60, y: 165, w: 45, h: 30 }, cardLayout('NON'), 1100);
 */
function drawCrossed(ctx: CanvasRenderingContext2D, box: Rect, card: CardLayout, t: number): void {
  const shake = t > 900 && t < 1300 ? ([0, 1, 0, -1][frameAt(t, 50, 4)] ?? 0) : 0;
  const x = box.x + Math.floor((box.w - card.w) / 2) + shake;
  const y = box.y + Math.floor((box.h - card.h) / 2) + Math.max(0, 6 - frameAt(t, 50));
  drawCard(ctx, x, y, card);
  if (t < 400) return;

  const long = Math.max(card.w, card.h);
  const n = Math.round(long * Math.min(1, (t - 400) / 400));
  for (let i = 0; i < n; i += 1) {
    const dx = Math.round((i / long) * (card.w - 2));
    const dy = Math.round((i / long) * (card.h - 2));
    paint(ctx, x + 1 + dx, y + 1 + dy, 1, 1, PAL.ink);
    if (t > 600) paint(ctx, x + card.w - 2 - dx, y + 1 + dy, 1, 1, PAL.ink);
  }
}
