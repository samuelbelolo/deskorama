import { BAY } from './grid.ts';
import type { Layout } from './layout.ts';
import type { LightMode } from './light-mode.ts';
import { paint } from './paint.ts';
import { PAL, type Tone } from './palette.ts';
import { toner } from './toner.ts';
import { drawStairwell } from './draw-stairwell.ts';

/** The x of each chimney stack on the roof. */
const CHIMNEYS = [18, 58, 150, 196, 236] as const;

/**
 * Draws the building's limestone shell under its zinc roof, the chimneys and the dark underside of every floor slab
 * that makes the cut section read; the rooms are drawn over it.
 * @example
 * drawBuilding(ctx, layout, 'day');
 */
export function drawBuilding(ctx: CanvasRenderingContext2D, layout: Layout, mode: LightMode): void {
  const tone = toner(mode);
  const { roofY, streetY, buildingW, top } = layout;

  paint(ctx, 0, roofY, buildingW, streetY - roofY, tone('stone'));
  drawRoof(ctx, layout, tone);
  drawStairwell(ctx, layout, tone);

  for (const row of [5, 7, 9, 11]) paint(ctx, 0, top + row * BAY - 1, buildingW, 1, tone('stone2'));
  paint(ctx, 0, roofY, buildingW, 1, tone('stone2'));
}

/**
 * Draws the zinc roof band with its standing seams, and the chimney stacks with their pots.
 * @example
 * drawRoof(ctx, layout, toner('day'));
 */
function drawRoof(ctx: CanvasRenderingContext2D, layout: Layout, tone: Tone): void {
  const { roofY, buildingW } = layout;

  paint(ctx, 0, roofY - 7, buildingW, 7, tone('zinc'));
  paint(ctx, 0, roofY - 8, buildingW, 1, PAL.ink);
  paint(ctx, 0, roofY - 7, buildingW, 1, tone('haze'));
  for (let x = 3; x < buildingW; x += 6) paint(ctx, x, roofY - 6, 1, 6, tone('slate'));

  for (const x of CHIMNEYS) {
    paint(ctx, x - 1, roofY - 19, 11, 12, PAL.ink);
    paint(ctx, x, roofY - 18, 9, 11, tone('stone'));
    paint(ctx, x, roofY - 15, 9, 1, tone('stone2'));
    paint(ctx, x, roofY - 11, 9, 1, tone('stone2'));

    for (const dx of [1, 4, 7]) {
      paint(ctx, x + dx - 1, roofY - 22, 3, 3, PAL.ink);
      paint(ctx, x + dx, roofY - 22, 1, 3, tone('dawn'));
    }
  }
}
