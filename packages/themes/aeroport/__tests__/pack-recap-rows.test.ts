import { describe, expect, test } from 'vitest';
import { packRecapRows } from '../src/pack-recap-rows.ts';

/** One row of 300 pixels, room for seven suitcases. */
const ONE_ROW = { rows: 1, width: 300, gap: 14, max: 7 };

describe('the recap belt’s rows', () => {
  test('lines suitcases up in order while they fit', () => {
    const placed = packRecapRows(
      [
        { width: 100, count: 1 },
        { width: 100, count: 2 },
      ],
      ONE_ROW,
      () => 60,
    );

    expect(placed.map(({ item, x }) => [item, x])).toEqual([
      [0, 0],
      [1, 114],
    ]);
  });

  test('starts a new row when the last one is full', () => {
    const placed = packRecapRows(
      [
        { width: 200, count: 1 },
        { width: 200, count: 1 },
      ],
      { ...ONE_ROW, rows: 2 },
      () => 60,
    );

    expect(placed.map(({ row, x }) => [row, x])).toEqual([
      [0, 0],
      [1, 0],
    ]);
  });

  test('folds what does not fit into a last suitcase, giving up neighbours until it fits, and adds up', () => {
    const items = [
      { width: 140, count: 1 },
      { width: 140, count: 5 },
      { width: 140, count: 3 },
    ];
    const placed = packRecapRows(items, ONE_ROW, () => 90);

    expect(placed.map(({ item }) => item)).toEqual([0, 'more']);
    expect(placed.reduce((sum, place) => sum + place.count, 0)).toBe(9);
  });

  test('keeps a seventh suitcase when it is the last one, and folds the rest beyond seven', () => {
    const seven = Array.from({ length: 7 }, () => ({ width: 10, count: 1 }));
    expect(packRecapRows(seven, ONE_ROW, () => 10).map(({ item }) => item)).toEqual([0, 1, 2, 3, 4, 5, 6]);

    const nine = Array.from({ length: 9 }, () => ({ width: 10, count: 1 }));
    expect(packRecapRows(nine, ONE_ROW, () => 10).at(-1)).toMatchObject({ item: 'more', count: 3 });
  });
});
