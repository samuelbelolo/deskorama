import { textWidth } from './text-width.ts';

/**
 * Returns the width of the widest of some rows, 0 for none.
 * @example
 * rowsWidth(['+129 €']); // 23
 */
export function rowsWidth(rows: readonly string[]): number {
  return Math.max(0, ...rows.map((row) => textWidth(row)));
}
