import { dimToner } from './dim-toner.ts';
import { BAY } from './grid.ts';
import { isOpen } from './is-open.ts';
import type { Layout } from './layout.ts';
import type { LightMode } from './light-mode.ts';
import { LIT } from './lit.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { FITTINGS } from './shop-fittings.ts';
import { SHOPS } from './shops.ts';

/** The units that never lower an iron shutter: the agency's window, the hall and the loge. */
const NEVER_SHUTTERED = new Set(['agency', 'hall', 'loge']);

/**
 * Draws the ground floor: each unit lit while open, dim when closed, and a lowered iron shutter on a shop closed
 * for the night.
 * @example
 * drawShops(ctx, layout, 'day', 14);
 */
export function drawShops(ctx: CanvasRenderingContext2D, layout: Layout, mode: LightMode, hour: number): void {
  const top = layout.rdcY;
  const floor = top + 27;

  for (const shop of SHOPS) {
    const open = isOpen(shop.id, hour) || (shop.id === 'hall' && mode !== 'night');
    const tone = open ? LIT : dimToner(mode);
    const x = shop.col * BAY;
    const w = shop.cols * BAY;

    paint(ctx, x + 1, top + 1, w - 2, 26, open ? PAL.litwall : tone('stone2'));
    paint(ctx, x + 1, top + 1, w - 2, 1, tone('stone2'));
    paint(ctx, x + 1, floor - 1, w - 2, 1, tone('wood'));
    FITTINGS[shop.id](ctx, { x, top, floor, tone, toneName: open ? 'day' : `dim-${mode}` });

    if (!open && !NEVER_SHUTTERED.has(shop.id)) drawIronShutter(ctx, x, w, top, mode);
  }
}

/**
 * Draws a lowered iron shop shutter, the Paris sign that a shop is closed for the night.
 * @example
 * drawIronShutter(ctx, 180, 45, 165, 'night');
 */
function drawIronShutter(ctx: CanvasRenderingContext2D, x: number, w: number, top: number, mode: LightMode): void {
  paint(ctx, x + 1, top + 1, w - 2, 26, mode === 'night' ? PAL.dusk : PAL.slate);
  for (let y = top + 2; y < top + 27; y += 2) paint(ctx, x + 1, y, w - 2, 1, PAL.night);
  paint(ctx, x + 1, top + 1, w - 2, 2, PAL.ink);
}
