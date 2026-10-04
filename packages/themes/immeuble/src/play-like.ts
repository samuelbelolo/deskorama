import type { Rect } from '@deskorama/core';
import { cardLayout, type CardLayout } from './card-layout.ts';
import { drawCard } from './draw-card.ts';
import { drawProp } from './draw-prop.ts';
import { drawThumb, THUMB_SIZE } from './draw-thumb.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { stageFor } from './stage-for.ts';
import { stageSizes } from './stage-sizes.ts';

const DURATION = 2600;
const KEY_T = 1300;

/**
 * like: someone gives a thumbs-up. A paper card with the Event's tag pops up and a big thumb rises beside it, small
 * hearts popping over it, and the neighbours cheer. Always a thumb, so it never reads as an approval's stamp; when
 * the stage is too narrow for both, the card goes and the thumb stays. Key pose: the thumb up.
 * @example
 * director.play(likeEvent); // through gagFor(event) === playLike
 */
export const playLike: Gag = (event, env) => {
  const card = cardLayout(event.meta.tag);
  const staged = stageFor(env, event, { duration: DURATION, sizes: stageSizes(event.rarity, card.w + THUMB_SIZE + 4) });
  if (staged === null) return null;

  return {
    duration: DURATION,
    keyT: KEY_T,
    blinkMs: 300,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'thumb',
    cue: { at: 0, run: (now) => env.cheerNear(staged.spot, now + 1500) },
    draw(ctx, t) {
      drawThumbsUp(ctx, staged.box, staged.box.w >= card.w + THUMB_SIZE + 3 ? card : null, t);
    },
  };
};

/**
 * Draws the card rising on the left, when there is room for it, the thumb rising on the right and the hearts.
 * @example
 * drawThumbsUp(ctx, { x: 60, y: 165, w: 45, h: 30 }, cardLayout('+1'), 1300);
 */
function drawThumbsUp(ctx: CanvasRenderingContext2D, box: Rect, card: CardLayout | null, t: number): void {
  const ground = box.y + box.h - 1;
  if (card !== null) drawCard(ctx, box.x + 2, ground - card.h - 4 + Math.max(0, 6 - frameAt(t, 50)), card);
  if (t < 350) return;

  const x = card === null ? box.x + Math.floor((box.w - THUMB_SIZE) / 2) : box.x + box.w - THUMB_SIZE - 1;
  const y = ground - THUMB_SIZE - 3 - Math.min(6, frameAt(t - 350, 40));
  drawThumb(ctx, x, y, 'up');

  const pop = frameAt(t - 350, 220, 3);
  drawProp(ctx, 'HEART', x - 6 + pop * 2, y - 8 - pop * 2);
  if (t > 700) drawProp(ctx, 'HEART', x + 14 - pop, y - 4 - pop * 3);
}
