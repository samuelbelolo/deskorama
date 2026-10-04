import { drawProp } from './draw-prop.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import type { SiteGeometry } from './site-geometry.ts';

/**
 * Draws the trolley on the jib, its cable and its hook, carrying a crate when loaded.
 * @example
 * drawHook(ctx, geometry, 230, 40, true);
 */
export function drawHook(
  ctx: CanvasRenderingContext2D,
  at: SiteGeometry,
  x: number,
  hookY: number,
  loaded: boolean,
): void {
  paint(ctx, x - 2, at.jibY + 3, 5, 2, PAL.ink);
  paint(ctx, x, at.jibY + 5, 1, Math.max(0, hookY - at.jibY - 5), PAL.ink);
  paint(ctx, x - 1, hookY, 3, 1, PAL.ink);
  paint(ctx, x + 1, hookY + 1, 1, 1, PAL.ink);
  if (loaded) drawProp(ctx, 'CRATE', x - 5, hookY + 2);
}
