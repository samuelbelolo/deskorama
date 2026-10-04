import type { Rect } from '@deskorama/core';
import { drawBig } from './draw-big.ts';
import { drawProp } from './draw-prop.ts';
import { drawText } from './draw-text.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { lookOf } from './look-of.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { plainText } from './plain-text.ts';
import { stageFor } from './stage-for.ts';
import { tagRows } from './tag-rows.ts';
import { textWidth } from './text-width.ts';

const DURATION = 2800;
const ARRIVED = 800;
const KEY_T = 1300;

/** The carriers of news, one per Source name, so each foreign system always comes the same way. */
const CARRIERS = ['postman', 'courier', 'tricycle'] as const;

/**
 * The generic Gag, for an Event without a Role or of a kind its Source did not describe: news is delivered to the
 * building, calmly, on a parcel lettered "VIA" over the Source's name. The carrier (a postman, a courier in an
 * orange cap, a cargo tricycle) follows the Source's name. Key pose: the carrier stopped with the parcel.
 * @example
 * director.play(foreignEvent); // through gagFor(event) === playDelivery
 */
export const playDelivery: Gag = (event, env) => {
  const staged = stageFor(env, event, { duration: DURATION, sizes: [[180, 120]] });
  if (staged === null) return null;

  const source = tagRows(event.source, 34, 1)?.[0] ?? plainText(event.source).slice(0, 8);
  const carrier = CARRIERS[lookOf(source) % CARRIERS.length] ?? 'postman';
  const via = [plainText(env.copy.text.props.via), source] as const;

  return {
    duration: DURATION,
    keyT: KEY_T,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'parcel',
    draw(ctx, t) {
      drawCarrier(ctx, staged.box, { carrier, via }, t);
    },
  };
};

/**
 * Draws the carrier coming in from the left, stopping with the parcel, then going on.
 * @example
 * drawCarrier(ctx, { x: 60, y: 165, w: 45, h: 30 }, { carrier: 'courier', via: ['VIA', 'MAIL'] }, 1300);
 */
function drawCarrier(
  ctx: CanvasRenderingContext2D,
  box: Rect,
  who: { readonly carrier: (typeof CARRIERS)[number]; readonly via: readonly [string, string] },
  t: number,
): void {
  const ground = box.y + box.h - 1;
  const enter = Math.min(1, t / ARRIVED);
  const leave = t > DURATION - 600 ? (t - (DURATION - 600)) / 600 : 0;
  const x = Math.round(box.x - 12 + enter * 13 + leave * (box.w + 4));

  if (who.carrier === 'tricycle') {
    drawProp(ctx, 'TRICYCLE', x, ground - 8);
    drawParcel(ctx, x + 6, ground - 6, who.via);
    return;
  }

  drawBig(ctx, { name: who.carrier === 'postman' ? 'POSTMAN' : 'COURIER' }, x, ground);
  drawParcel(ctx, x + 11, ground, who.via);
  if (t < ARRIVED && frameAt(t, 200, 2) === 1) paint(ctx, x + 1, ground, 2, 1, PAL.stone2);
}

/**
 * Draws a taped cardboard parcel standing on a line, its two lines lettered in ink.
 * @example
 * drawParcel(ctx, 72, 194, ['VIA', 'MAIL']);
 */
function drawParcel(ctx: CanvasRenderingContext2D, x: number, bottom: number, lines: readonly [string, string]): void {
  const w = Math.max(...lines.map((line) => textWidth(line))) + 6;
  const y = bottom - 16;

  paint(ctx, x, y, w, 17, PAL.ink);
  paint(ctx, x + 1, y + 1, w - 2, 15, PAL.litwall);
  paint(ctx, x + 1, y + 1, w - 2, 1, PAL.umber);
  lines.forEach((line, i) => drawText(ctx, line, x + Math.floor((w - textWidth(line)) / 2), y + 3 + i * 7, PAL.ink));
}
