import { accentGap } from './accent-gap.ts';
import type { SignLine } from './sign-line.ts';
import { textWidth } from './text-width.ts';

/** One row of a stack, before it is placed. */
export interface StackRow {
  readonly text: string;
  readonly colour: string;
  readonly scale?: number;
}

/**
 * Returns rows stacked from `top`, each centred on `cx`: 7 pixels apart at scale 1 and 12 at scale 2, plus the gap
 * an accent needs, so an accent never touches the row above.
 * @example
 * stackLines([{ text: 'INTRUS', colour: PAL.paper }, { text: 'BLOQUÉS', colour: PAL.paper }], 120, 167);
 * // the second row 9 pixels under the first
 */
export function stackLines(rows: readonly StackRow[], cx: number, top: number): SignLine[] {
  const lines: SignLine[] = [];
  let y = top;
  let above: StackRow | null = null;

  for (const row of rows) {
    const scale = row.scale ?? 1;
    if (above !== null) y += ((above.scale ?? 1) === 2 ? 12 : 7) + accentGap(above.text, row.text);
    lines.push({ text: row.text, x: Math.round(cx - textWidth(row.text, scale) / 2), y, scale, colour: row.colour });
    above = row;
  }

  return lines;
}
