import type { Copy } from './create-copy.ts';
import { tagRows } from './tag-rows.ts';
import { textWidth } from './text-width.ts';

/**
 * Returns the heading rows of the total's sign: the Source's word split at its space ("TICKETS / OUVERTS"), or the
 * word over the Source's name ("ISSUES / TRAMLO").
 * @example
 * totalRows(copy, 39); // ["ISSUES", "TRAMLO"]
 */
export function totalRows(copy: Copy, width: number): string[] {
  const rows = tagRows(copy.gaugeWord('total'), width, 2) ?? [];
  if (rows.length >= 2) return rows;

  return textWidth(copy.brand) <= width ? [...rows, copy.brand] : rows;
}
