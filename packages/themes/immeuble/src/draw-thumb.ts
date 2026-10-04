import { LIT } from './lit.ts';
import { PROPS } from './prop-sprites.ts';
import { sprite } from './sprite.ts';

/** The hand's size on screen, in native pixels: twice its pixel map, to read across the room. */
export const THUMB_SIZE = 20;

/**
 * Draws the big hand with its top-left corner at (x, y): thumb down for a refusal, flipped thumb up for a like.
 * @example
 * drawThumb(ctx, 150, 170, 'up');
 */
export function drawThumb(ctx: CanvasRenderingContext2D, x: number, y: number, way: 'up' | 'down'): void {
  const art = sprite('thumb', PROPS.THUMB_DOWN, { k: 'ink', s: 'skin', d: 'denim' }, LIT);
  const left = Math.round(x);
  const top = Math.round(y);

  if (way === 'down') {
    ctx.drawImage(art, left, top, THUMB_SIZE, THUMB_SIZE);
    return;
  }

  ctx.save();
  ctx.translate(left, top + THUMB_SIZE);
  ctx.scale(1, -1);
  ctx.drawImage(art, 0, 0, THUMB_SIZE, THUMB_SIZE);
  ctx.restore();
}
