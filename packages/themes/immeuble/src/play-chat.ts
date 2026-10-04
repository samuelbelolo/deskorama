import type { Rect } from '@deskorama/core';
import { drawBig } from './draw-big.ts';
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

const DURATION = 2600;
const SENT = 1100;
const KEY_T = 1500;

/**
 * message: someone writes, a question, a request, a chat. A tenant on their phone and a big speech bubble over them:
 * typing dots, then a vermilion "?" and the Event's tag. Key pose: the bubble with its "?".
 * @example
 * director.play(messageEvent); // through gagFor(event) === playChat
 */
export const playChat: Gag = (event, env) => {
  const tag = tagWord(event, 30);
  const bubbleW = tag === '' ? 28 : Math.max(28, textWidth(tag) + 16);
  const staged = stageFor(env, event, { duration: DURATION, sizes: stageSizes('notable', bubbleW + 15) });
  if (staged === null) return null;

  const look = 11 + lookOf(event.id);

  return {
    duration: DURATION,
    keyT: KEY_T,
    blinkMs: 250,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'bubble',
    draw(ctx, t) {
      const { box } = staged;
      const fits = bubbleW + 15 <= box.w;
      drawBig(ctx, { look, pose: 'PHONE' }, box.x + 2, box.y + box.h - 1);
      drawBubble(
        ctx,
        { x: box.x + 15, y: box.y + 1 + Math.max(0, 4 - frameAt(t, 50)), w: fits ? bubbleW : 28, h: 15 },
        fits ? tag : '',
        t,
      );
    },
  };
};

/**
 * Draws the speech bubble with its tail toward the tenant: typing dots, then a big "?" and the tag.
 * @example
 * drawBubble(ctx, { x: 75, y: 166, w: 35, h: 15 }, '#12', 1500);
 */
function drawBubble(ctx: CanvasRenderingContext2D, b: Rect, tag: string, t: number): void {
  const { x, y, w, h } = b;
  paint(ctx, x, y, w, h, PAL.ink);
  paint(ctx, x + 1, y + 1, w - 2, h - 2, PAL.paper);
  paint(ctx, x + 1, y + h, 3, 1, PAL.ink);
  paint(ctx, x - 1, y + h + 1, 2, 1, PAL.ink);
  paint(ctx, x + 1, y + h - 1, 3, 1, PAL.paper);

  if (t < SENT) {
    const dots = 1 + frameAt(t, 250, 3);
    for (let i = 0; i < dots; i += 1) paint(ctx, x + 7 + i * 5, y + 7, 3, 2, PAL.ink);
    return;
  }

  if (tag === '') {
    drawText(ctx, '?', x + 11, y + 2, PAL.accent, 2);
    return;
  }

  drawText(ctx, '?', x + 4, y + 2, PAL.accent, 2);
  drawText(ctx, tag, x + 12, y + 5, PAL.ink);
}
