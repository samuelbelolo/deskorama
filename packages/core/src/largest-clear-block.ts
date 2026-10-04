import type { Grid, TileBlock } from './tile-block.ts';

/**
 * Returns the largest block of tiles that are all clear in the grid mask (the maximal rectangle, row by row over
 * column heights), or null when every tile is set. Among equal areas, the first found from the top-left wins.
 * @example
 * largestClearBlock(new Uint8Array(24 * 15), { cols: 24, rows: 15 }); // { col: 0, row: 0, cols: 24, rows: 15 }
 */
export function largestClearBlock(mask: Uint8Array, grid: Grid): TileBlock | null {
  const heights = Array.from({ length: grid.cols }, () => 0);
  let best: { block: TileBlock; area: number } | null = null;
  for (let row = 0; row < grid.rows; row += 1) {
    for (let col = 0; col < grid.cols; col += 1) {
      heights[col] = mask[row * grid.cols + col] === 0 ? (heights[col] ?? 0) + 1 : 0;
    }
    for (let first = 0; first < grid.cols; first += 1) {
      let lowest = Infinity;
      for (let last = first; last < grid.cols && (heights[last] ?? 0) > 0; last += 1) {
        lowest = Math.min(lowest, heights[last] ?? 0);
        const cols = last - first + 1;
        if (best === null || lowest * cols > best.area) {
          best = { block: { col: first, row: row - lowest + 1, cols, rows: lowest }, area: lowest * cols };
        }
      }
    }
  }
  return best?.block ?? null;
}
