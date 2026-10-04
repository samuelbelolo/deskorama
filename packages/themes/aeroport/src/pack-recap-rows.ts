/** A suitcase to lay out: how wide its tag is and how many missed Events it counts. */
export interface Packed {
  readonly width: number;
  readonly count: number;
}

/** Where one suitcase goes: the case it shows (or the last "+ N more" one), its row from the belt up, and its left. */
export interface Placement {
  /** The index of the case, or `'more'` for the last suitcase that counts the rest. */
  readonly item: number | 'more';
  readonly row: number;
  readonly x: number;
  readonly width: number;
  /** How many missed Events it counts. */
  readonly count: number;
}

/** The room on the belt: how many rows of suitcases, how wide each, and the gap between two suitcases. */
export interface BeltRoom {
  readonly rows: number;
  readonly width: number;
  readonly gap: number;
  /** At most this many suitcases, the last one counting the rest. */
  readonly max: number;
}

/**
 * Lays suitcases out in rows from the belt up, in order, each row filled before the next. The ones that do not fit
 * are folded into a last suitcase as wide as `moreWidth(count)` says, giving up its neighbours until it fits, so the
 * counts always add up to every case's count.
 * @example
 * packRecapRows([{ width: 200, count: 1 }, { width: 150, count: 5 }], { rows: 1, width: 300, gap: 14, max: 7 }, () => 90);
 * // [{ item: 0, row: 0, x: 0, width: 200, count: 1 }, { item: 'more', row: 0, x: 214, width: 90, count: 5 }]
 */
export function packRecapRows(
  items: readonly Packed[],
  room: BeltRoom,
  moreWidth: (count: number) => number,
): Placement[] {
  const placed: Placement[] = [];
  let row = 0;
  let x = 0;

  for (const [index, item] of items.entries()) {
    if (x > 0 && x + item.width > room.width) {
      row += 1;
      x = 0;
    }

    // The last suitcase of all may take the place kept for the one that counts the rest.
    const spare = room.max - (index === items.length - 1 ? 0 : 1);
    if (row >= room.rows || placed.length >= spare || item.width > room.width) {
      return withMore(placed, items.slice(index), room, moreWidth);
    }

    placed.push({ item: index, row, x, width: item.width, count: item.count });
    x += item.width + room.gap;
  }

  return placed;
}

/**
 * Returns the placements with a last suitcase counting `rest`, taking back the latest placed suitcases into it until
 * it fits at the end of the rows.
 * @example
 * withMore(placed, rest, room, () => 90).at(-1)?.item; // "more"
 */
function withMore(
  placed: readonly Placement[],
  rest: readonly Packed[],
  room: BeltRoom,
  moreWidth: (count: number) => number,
): Placement[] {
  const kept = [...placed];
  let count = rest.reduce((sum, item) => sum + item.count, 0);

  for (;;) {
    const last = kept.at(-1);
    const end = last === undefined ? { row: 0, x: 0 } : { row: last.row, x: last.x + last.width + room.gap };
    const width = moreWidth(count);
    const fits = end.x === 0 || end.x + width <= room.width ? end : { row: end.row + 1, x: 0 };

    if (fits.row < room.rows || last === undefined) return [...kept, { item: 'more', ...fits, width, count }];

    kept.pop();
    count += last.count;
  }
}
