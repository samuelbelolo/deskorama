import { drawCast } from './draw-cast.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import type { SiteGeometry } from './site-geometry.ts';

/** When the ribbon is cut, into the delivery. */
const CUT_MS = 1100;

/**
 * Draws the delivery on the roof: a red ribbon across the crates, cut after a moment, and the two workers cheering.
 * @example
 * drawDelivery(ctx, geometry, 202, 1500);
 */
export function drawDelivery(ctx: CanvasRenderingContext2D, at: SiteGeometry, slots: number, t: number): void {
  const y = at.roofTop - 5;
  const cut = t > CUT_MS;

  if (cut) {
    paint(ctx, slots - 4, y, 1, 5, PAL.accent);
    paint(ctx, slots + 33, y, 1, 5, PAL.accent);
  } else {
    paint(ctx, slots - 4, y, 38, 1, PAL.accent);
    paint(ctx, slots + 13, y - 1, 4, 3, PAL.accent);
    paint(ctx, slots + 14, y, 2, 1, PAL.ink);
  }

  const cheer = cut && Math.floor(t / 250) % 2 === 0;
  drawCast(ctx, cheer ? 'WORKER_CHEER' : 'WORKER_A', slots - 8, at.roofTop - 1);
  drawCast(ctx, cheer ? 'WORKER_A' : 'WORKER_CHEER', slots + 34, at.roofTop - 1, true);
}
