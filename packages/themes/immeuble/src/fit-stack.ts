import type { Rect } from '@deskorama/core';
import type { SignLine } from './sign-line.ts';
import { stackLines, type StackRow } from './stack-lines.ts';
import { textWidth } from './text-width.ts';

/**
 * Returns the first of several stacks, richest first, whose lines all fit inside a framed sign with a pixel of margin;
 * the last one when none does.
 * @example
 * fitStack([[title, word, bigNumber], [word, number]], frame); // the second when the first is too tall
 */
export function fitStack(candidates: readonly (readonly StackRow[])[], frame: Rect): SignLine[] {
  let lines: SignLine[] = [];

  for (const rows of candidates) {
    lines = stackLines(rows, frame.x + frame.w / 2, frame.y + 2);
    const last = lines.at(-1);
    const tall = last === undefined ? 0 : last.y + 5 * last.scale;
    const wide = Math.max(0, ...rows.map((row) => textWidth(row.text, row.scale ?? 1)));
    if (tall <= frame.y + frame.h - 2 && wide <= frame.w - 4) return lines;
  }

  return lines;
}
