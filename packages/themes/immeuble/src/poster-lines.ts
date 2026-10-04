import type { Rect } from '@deskorama/core';
import type { Copy } from './create-copy.ts';
import { stackLines } from './stack-lines.ts';
import type { SignLine } from './sign-line.ts';
import { textWidth } from './text-width.ts';
import { totalRows } from './total-rows.ts';

/**
 * Returns the kiosk poster in a native frame: the total's heading on one or two rows, then its value, in big digits
 * when they fit.
 * @example
 * posterLines(copy, 37, { x: 182, y: 166, w: 41, h: 26 }, PAL.ink); // ISSUES / TRAMLO / 37
 */
export function posterLines(copy: Copy, total: number, frame: Rect, ink: string): SignLine[] {
  const cx = frame.x + frame.w / 2;
  const value = copy.number(total);
  const heading = totalRows(copy, frame.w - 2).map((text) => ({ text, colour: ink }));
  const stacked = stackLines(heading, cx, frame.y + 2);
  const last = stacked.at(-1);
  const below = last === undefined ? frame.y + 2 : last.y + 7;
  const scale = textWidth(value, 2) <= frame.w - 2 && below + 10 <= frame.y + frame.h - 1 ? 2 : 1;

  return [
    ...stacked,
    {
      text: value,
      x: Math.round(cx - textWidth(value, scale) / 2),
      y: below + (scale === 2 ? 0 : 1),
      scale,
      colour: ink,
    },
  ];
}
