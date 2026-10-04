import { drawProp } from './draw-prop.ts';
import type { SiteGeometry } from './site-geometry.ts';

/**
 * Draws what a failed deploy left on the roof: two heaps of rubble and a fallen plank.
 * @example
 * drawWreck(ctx, geometry, 202);
 */
export function drawWreck(ctx: CanvasRenderingContext2D, at: SiteGeometry, slots: number): void {
  drawProp(ctx, 'RUBBLE', slots - 2, at.roofTop - 4);
  drawProp(ctx, 'RUBBLE', slots + 14, at.roofTop - 4);
  drawProp(ctx, 'PLANK', slots + 4, at.roofTop - 2);
}
