import { BAY } from './grid.ts';
import type { Layout } from './layout.ts';
import type { LightMode } from './light-mode.ts';
import { NEXT_BAYS } from './lot-geometry.ts';
import { paint } from './paint.ts';
import { PAL, type Tone } from './palette.ts';
import { toner } from './toner.ts';

/** The next building's width in native pixels. */
const NEXT_W = NEXT_BAYS * BAY;

/** The chimney stack stands between the second and the third dormer. */
const CHIMNEY_X = 134;

/**
 * Draws the shell of the next building along the street: a darker limestone than next door, its floor slabs with a
 * dentil cornice, and a steep zinc mansard with three big dormers and one wide chimney; the rooms and the café are
 * drawn over it.
 * @example
 * drawNextBuilding(ctx, layout, 'day');
 */
export function drawNextBuilding(ctx: CanvasRenderingContext2D, layout: Layout, mode: LightMode): void {
  const tone = toner(mode);
  const { roofY, streetY, top } = layout;

  paint(ctx, 0, roofY - 10, NEXT_W, streetY - roofY + 10, tone('stone2'));
  drawMansard(ctx, layout, tone);

  for (const row of [5, 7, 9, 11]) {
    const y = top + row * BAY;
    paint(ctx, 0, y - 1, NEXT_W, 1, tone('umber'));
    paint(ctx, 0, y - 3, NEXT_W, 1, PAL.ink);
    for (let x = 2; x < NEXT_W; x += 4) paint(ctx, x, y - 3, 1, 2, PAL.ink);
  }

  paint(ctx, NEXT_W - 1, roofY - 10, 1, streetY - roofY + 10, PAL.ink);
}

/**
 * Draws the zinc mansard: its ridge, three dormers with their pointed hoods, and the chimney stack with its pots.
 * @example
 * drawMansard(ctx, layout, toner('day'));
 */
function drawMansard(ctx: CanvasRenderingContext2D, layout: Layout, tone: Tone): void {
  const { roofY } = layout;

  paint(ctx, 0, roofY - 12, NEXT_W, 3, PAL.ink);
  paint(ctx, 0, roofY - 11, NEXT_W, 1, tone('zinc'));

  for (let i = 0; i < 3; i += 1) {
    const x = 20 + i * 75;
    paint(ctx, x - 1, roofY - 22, 18, 12, PAL.ink);
    paint(ctx, x, roofY - 21, 16, 11, tone('stone'));
    paint(ctx, x + 3, roofY - 19, 10, 8, tone('slate'));
    paint(ctx, x + 7, roofY - 19, 1, 8, tone('stone'));
    for (let k = 0; k < 9; k += 1)
      paint(ctx, x - 1 + k, roofY - 23 - Math.floor(k / 2), Math.max(0, 18 - 2 * k), 1, PAL.ink);
  }

  paint(ctx, CHIMNEY_X - 1, roofY - 30, 18, 18, PAL.ink);
  paint(ctx, CHIMNEY_X, roofY - 29, 16, 17, tone('stone'));
  paint(ctx, CHIMNEY_X, roofY - 24, 16, 1, tone('stone2'));
  for (const dx of [2, 7, 12]) paint(ctx, CHIMNEY_X + dx, roofY - 33, 2, 4, tone('dawn'));
}
