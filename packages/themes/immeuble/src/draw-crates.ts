import { drawProp } from './draw-prop.ts';
import type { SiteGeometry } from './site-geometry.ts';

/** How many crates a deploy builds. */
export const CRATES = 3;

/**
 * Draws crates sitting on the roof, left to right from x.
 * @example
 * drawCrates(ctx, geometry, 202, 3);
 */
export function drawCrates(ctx: CanvasRenderingContext2D, at: SiteGeometry, x: number, count: number): void {
  for (let i = 0; i < count; i += 1) drawProp(ctx, 'CRATE', x + i * 10, at.roofTop - 8);
}
