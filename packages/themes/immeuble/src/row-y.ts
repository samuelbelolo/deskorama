import { TILE } from './grid.ts';
import type { Layout } from './layout.ts';

/**
 * Returns the screen y of one of the building block's tile rows: 0 for the top of the sky over the roof, 11 for the
 * ground floor, 13 for the street.
 * @example
 * rowY(layoutFor(FAKE_SCREEN), 11); // 660
 */
export function rowY(layout: Layout, row: number): number {
  return (layout.topRow + row) * TILE;
}
