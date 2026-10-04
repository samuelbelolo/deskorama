import type { Recap } from '@deskorama/core';
import type { Copy } from './create-copy.ts';
import type { Forms } from './strings.ts';
import { textWidth } from './text-width.ts';

/** One cell of the recap board: how many Events, and the noun they are counted under. */
interface RecapCell {
  readonly count: number;
  readonly noun: Forms;
}

/** The cells the board shows, and the x of each column from the board's inner edge, in native pixels. */
export interface RecapLayout {
  readonly cells: readonly RecapCell[];
  readonly columns: readonly number[];
}

/** A cell's number column and the gap before its noun, in native pixels. */
const NUMBER_W = 10;
const GAP = 3;

/**
 * Lays the recap's cells out on a board: one cell per Role, rarest first as the engine sorted them, then "N AUTRES"
 * for the Roles left out; as many columns of `rows` cells as `width` holds, each as wide as its longest noun. When
 * they do not all fit, the last cell counts every Role left out, so the cells always add up to the recap's total.
 * @example
 * recapCells(copy, recap, { rows: 3, width: 142 }).cells.map((cell) => cell.count); // [1, 5, 2, 5]
 */
export function recapCells(
  copy: Copy,
  recap: Recap,
  room: { readonly rows: number; readonly width: number },
): RecapLayout {
  const { nouns, more } = copy.text.recap;
  const all: RecapCell[] = recap.groups.map((group) => ({
    count: group.count,
    noun: nouns[group.archetype ?? 'other'],
  }));
  if (recap.more > 0) all.push({ count: recap.more, noun: more });

  for (let shown = Math.min(all.length, room.rows * 4); shown >= 1; shown -= 1) {
    const cells = shown === all.length ? all : [...all.slice(0, shown - 1), rest(all.slice(shown - 1), more)];
    const columns = columnsOf(copy, cells, room.rows);
    const used = (columns.at(-1) ?? 0) + widest(copy, cells.slice((columns.length - 1) * room.rows));
    if (used <= room.width) return { cells, columns };
  }

  return { cells: [rest(all, more)], columns: [0] };
}

/**
 * Returns one cell counting every Event of the given cells, under the "others" noun.
 * @example
 * rest([{ count: 2, noun: ['REFUS', 'REFUS'] }, { count: 3, noun: ['AUTRE', 'AUTRES'] }], ['AUTRE', 'AUTRES']).count; // 5
 */
function rest(cells: readonly RecapCell[], noun: Forms): RecapCell {
  return { count: cells.reduce((sum, cell) => sum + cell.count, 0), noun };
}

/**
 * Returns the x of each column of `rows` cells, each as wide as the widest cell in it.
 * @example
 * columnsOf(copy, cells, 3); // [0, 78]
 */
function columnsOf(copy: Copy, cells: readonly RecapCell[], rows: number): number[] {
  const columns: number[] = [];
  let x = 0;

  for (let i = 0; i < cells.length; i += rows) {
    columns.push(x);
    x += widest(copy, cells.slice(i, i + rows)) + 6;
  }

  return columns;
}

/**
 * Returns the width of the widest of some cells, its number and its noun in the plural.
 * @example
 * widest(copy, [{ count: 5, noun: ['VALIDATION', 'VALIDATIONS'] }]); // 57
 */
function widest(copy: Copy, cells: readonly RecapCell[]): number {
  return Math.max(0, ...cells.map((cell) => NUMBER_W + GAP + textWidth(copy.fill(cell.noun[1]))));
}
