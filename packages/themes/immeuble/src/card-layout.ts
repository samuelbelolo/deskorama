import { accentGap } from './accent-gap.ts';
import { rowsWidth } from './rows-width.ts';
import { tagRows } from './tag-rows.ts';

/** A paper card's tag rows, where each sits, and its size in native pixels. */
export interface CardLayout {
  readonly rows: readonly string[];
  readonly tops: readonly number[];
  readonly w: number;
  readonly h: number;
}

/**
 * Returns the card a like or a rejection reacts to: it widens for its tag, up to two rows, 7 pixels apart plus the
 * gap an accent needs; a few grey lines when there is no tag.
 * @example
 * cardLayout('+1'); // { rows: ['+1'], tops: [5], w: 22, h: 14 }
 * cardLayout('LOT 550 €'); // { rows: ['LOT', '550 €'], tops: [5, 12], w: 30, h: 21 }
 */
export function cardLayout(tag: string): CardLayout {
  const rows = tagRows(tag, 30) ?? [];
  const tops: number[] = [];
  let top = 5;

  rows.forEach((row, i) => {
    if (i > 0) top += 7 + accentGap(rows[i - 1] ?? '', row);
    tops.push(top);
  });

  return { rows, tops, w: Math.max(22, rowsWidth(rows) + 8), h: rows.length > 0 ? top + 9 : 14 };
}
