import type { Rect } from '@deskorama/core';
import { cardLayout, type CardLayout } from './card-layout.ts';
import { drawCard } from './draw-card.ts';
import { drawThumb, THUMB_SIZE } from './draw-thumb.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { stageFor } from './stage-for.ts';

const DURATION = 2400;
const KEY_T = 1100;

/**
 * rejection, first picture: something was turned down. A paper card with the Event's tag rises, a big thumb comes
 * down beside it and the card falls. It needs a 240 px stage: without one, the cross plays instead. Never a stamp:
 * approval owns the stamp. Key pose: the thumb down by the card.
 * @example
 * playThumbDown(rejectionEvent, env);
 */
export const playThumbDown: Gag = (event, env) => {
  const card = cardLayout(event.meta.tag);
  const staged = stageFor(env, event, { duration: DURATION, sizes: [[240, 120]] });
  if (staged === null) return null;

  return {
    duration: DURATION,
    keyT: KEY_T,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'thumb-down',
    draw(ctx, t) {
      drawRefusal(ctx, staged.box, card, t);
    },
  };
};

/**
 * Draws the card rising on the left, the thumb dropping beside it, then the card falling.
 * @example
 * drawRefusal(ctx, { x: 60, y: 165, w: 45, h: 30 }, cardLayout('#12'), 1100);
 */
function drawRefusal(ctx: CanvasRenderingContext2D, box: Rect, card: CardLayout, t: number): void {
  const rise = Math.max(0, 6 - frameAt(t, 50));
  const fall = t > KEY_T + 300 ? frameAt(t - KEY_T - 300, 40) : 0;
  if (t < KEY_T + 700) drawCard(ctx, box.x + 2, box.y + box.h - card.h - 8 + rise + Math.min(fall, 8), card);
  if (t < 450) return;

  const drop = Math.max(0, 8 - frameAt(t - 450, 30));
  drawThumb(ctx, box.x + box.w - THUMB_SIZE - 1, box.y + box.h - THUMB_SIZE - drop, 'down');
}
