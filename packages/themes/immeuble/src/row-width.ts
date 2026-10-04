import type { PlaqueRow } from './plaque-row.ts';
import { textWidth } from './text-width.ts';

/**
 * Returns the width of a plaque row: its text, plus the detail after the fact when it shares the row.
 * @example
 * rowWidth({ text: 'PDF EXPORTÉ', tail: 'RAPPORT', colour: PAL.paper, scale: 1 }); // 75
 */
export function rowWidth(row: PlaqueRow): number {
  return textWidth(row.text, row.scale) + (row.tail === undefined ? 0 : 8 + textWidth(row.tail));
}
