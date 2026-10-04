import { accentGap } from './accent-gap.ts';
import type { PlaqueRow } from './plaque-row.ts';

/**
 * Returns the top of each plaque row from the plaque's top edge, and the plaque's height: 8 pixels per row at scale
 * 1 and 13 at scale 2, plus the gap an accent needs, inside a 4-pixel top margin.
 * @example
 * rowTops([{ text: 'MISE EN LIGNE', ... }, { text: 'RÉUSSIE', ... }]); // { tops: [4, 14], height: 21 }
 */
export function rowTops(rows: readonly PlaqueRow[]): { tops: number[]; height: number } {
  const tops: number[] = [];
  let y = 4;
  let above: PlaqueRow | null = null;

  for (const row of rows) {
    if (above !== null) y += accentGap(above.text + (above.tail ?? ''), row.text + (row.tail ?? ''));
    tops.push(y);
    y += row.scale === 2 ? 13 : 8;
    above = row;
  }

  return { tops, height: y - 1 };
}
