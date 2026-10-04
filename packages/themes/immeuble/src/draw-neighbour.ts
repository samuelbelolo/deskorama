import { BAY } from './grid.ts';
import type { Layout } from './layout.ts';
import type { LightMode } from './light-mode.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { toner } from './toner.ts';

/**
 * Draws the neighbour's closed facade in whatever width a screen has beyond the building: limestone, a zinc roof,
 * shuttered windows on each floor and a closed carriage door on the ground floor.
 * @example
 * drawNeighbour(ctx, layout, 'day'); // nothing on a 1440 px screen
 */
export function drawNeighbour(ctx: CanvasRenderingContext2D, layout: Layout, mode: LightMode): void {
  const left = layout.buildingW;
  const w = layout.W - left;
  if (w <= 0) return;

  const tone = toner(mode);
  const { roofY, streetY, rdcY, top } = layout;

  paint(ctx, left, roofY - 4, w, streetY - roofY + 4, tone('stone2'));
  paint(ctx, left, roofY - 5, w, 1, PAL.ink);
  paint(ctx, left, roofY - 4, w, 4, tone('zinc'));
  paint(ctx, left, roofY - 4, 1, streetY - roofY + 4, PAL.ink);

  for (const row of [5, 7, 9]) {
    for (let x = left + 6; x + 9 < layout.W; x += BAY) {
      const y = top + row * BAY + 6;
      paint(ctx, x, y, 7, 14, tone('moss'));
      for (let line = y + 1; line < y + 14; line += 2) paint(ctx, x, line, 7, 1, tone('leaf'));
    }
  }

  paint(ctx, left + 4, rdcY + 6, Math.min(24, w - 8), 24, tone('wood'));
}
