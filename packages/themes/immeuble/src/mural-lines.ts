import type { Rect } from '@deskorama/core';
import type { Copy } from './create-copy.ts';
import { PAL } from './palette.ts';
import type { SignLine } from './sign-line.ts';
import { textWidth } from './text-width.ts';

/**
 * Returns the ad painted on the vacant lot's blind wall in a native frame: the total's word big at the top, its
 * value in the biggest digits that fit, and the total's full label (or the Source's name when it is too long)
 * along the bottom.
 * @example
 * muralLines(copy, 37, { x: 249, y: 48, w: 128, h: 58 }); // ISSUES / 37 / ISSUES OUVERTES
 */
export function muralLines(copy: Copy, total: number, frame: Rect): SignLine[] {
  const cx = frame.x + frame.w / 2;
  const title = copy.gaugeWord('total');
  const titleScale = textWidth(title, 2) <= frame.w - 6 ? 2 : 1;
  const value = copy.number(total);
  const valueScale = [4, 3, 2].find((scale) => textWidth(value, scale) <= frame.w - 12) ?? 1;
  const label = copy.gaugeWord('total', 'label');
  const foot = textWidth(label) <= frame.w - 6 ? label : copy.brand;

  const centred = (text: string, scale: number): number => Math.round(cx - textWidth(text, scale) / 2);

  return [
    { text: title, x: centred(title, titleScale), y: frame.y + 6, scale: titleScale, colour: PAL.paper },
    {
      text: value,
      x: centred(value, valueScale),
      y: frame.y + 20 + Math.floor(((4 - valueScale) * 5) / 2),
      scale: valueScale,
      colour: PAL.lamp,
    },
    { text: foot, x: centred(foot, 1), y: frame.y + frame.h - 10, scale: 1, colour: PAL.paper },
  ];
}
