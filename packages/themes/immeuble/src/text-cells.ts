import type { Point } from '@deskorama/core';
import { glyphOf } from './glyph-of.ts';

/** The cells a text paints, each `scale` pixels square: the letters, and their accents apart. */
export interface TextCells {
  readonly body: readonly Point[];
  readonly marks: readonly Point[];
  /** The x after the last glyph. */
  readonly end: number;
}

/**
 * Returns the top-left corner of every cell a text paints with its left edge at `x` and its cap height at `y`, in
 * native pixels. Drawing and the accent check both read it, so they never disagree.
 * @example
 * textCells('É', 0, 10).marks; // [{ x: 2, y: 7 }, { x: 1, y: 8 }]
 */
export function textCells(text: string, x: number, y: number, scale = 1): TextCells {
  const body: Point[] = [];
  const marks: Point[] = [];
  let cursor = Math.round(x);
  const top = Math.round(y);

  for (const ch of text) {
    const { rows, marks: accent } = glyphOf(ch);

    rows.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx += 1) {
        if (row[rx] === '#') body.push({ x: cursor + rx * scale, y: top + ry * scale });
      }
    });
    for (const [mx, my] of accent) marks.push({ x: cursor + mx * scale, y: top + my * scale });

    cursor += ((rows[0]?.length ?? 0) + 1) * scale;
  }

  return { body, marks, end: cursor - scale };
}
