import type { Layout } from './layout.ts';
import type { LightMode } from './light-mode.ts';
import { lotGeometry, type LotGeometry } from './lot-geometry.ts';
import { paint } from './paint.ts';
import { PAL, type Tone } from './palette.ts';
import { toner } from './toner.ts';

/**
 * Draws the vacant lot beside the next building: the blind wall at its back with the ghost of the building that was
 * pulled down (its floor lines and stairs), and the green plank hoarding that closes it along the street. The
 * painted ad and the boards on the hoarding are drawn over it as signs.
 * @example
 * drawLot(ctx, layout, 'day');
 */
export function drawLot(ctx: CanvasRenderingContext2D, layout: Layout, mode: LightMode): void {
  const tone = toner(mode);
  const lot = lotGeometry(layout);
  const { W, roofY, streetY } = layout;
  const top = roofY - 30;

  paint(ctx, lot.x, top, W - lot.x, streetY - top, tone('stone'));
  paint(ctx, lot.x, top, W - lot.x, 1, PAL.ink);
  for (let x = lot.x + 3; x < W; x += 9) paint(ctx, x, top + 1, 1, 2, tone('stone2'));

  for (const y of [roofY + 15, roofY + 45, roofY + 75]) {
    paint(ctx, lot.x, y, W - lot.x, 1, tone('stone2'));
    for (let i = 0; i < 14; i += 1) paint(ctx, lot.x + 6 + i * 2, y - i, 2, 1, tone('stone2'));
  }

  paint(ctx, W - 30, top, 8, streetY - top, tone('stone2'));
  paint(ctx, lot.x, lot.hoardY - 4, W - lot.x, 4, tone('umber'));
  drawHoarding(ctx, layout, lot, tone);
}

/**
 * Draws the green plank hoarding along the street, from the lot's edge to the screen's.
 * @example
 * drawHoarding(ctx, layout, lotGeometry(layout), toner('day'));
 */
function drawHoarding(ctx: CanvasRenderingContext2D, layout: Layout, lot: LotGeometry, tone: Tone): void {
  const { W, streetY } = layout;

  paint(ctx, lot.x, lot.hoardY - 1, W - lot.x, streetY - lot.hoardY + 1, PAL.ink);
  for (let x = lot.x; x < W; x += 4)
    paint(ctx, x, lot.hoardY, 3, streetY - lot.hoardY, tone(x % 8 < 4 ? 'moss' : 'leaf'));
  paint(ctx, lot.x, lot.hoardY + 12, W - lot.x, 1, PAL.ink);
}
