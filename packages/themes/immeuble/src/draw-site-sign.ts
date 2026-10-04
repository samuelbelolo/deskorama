import type { Copy } from './create-copy.ts';
import { drawSignLines } from './draw-sign-lines.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { SIGN_W } from './site-geometry.ts';
import { siteSignLines } from './site-sign-lines.ts';
import type { SiteStatus } from './site-status.ts';

/**
 * Draws the site sign at (x, y), 74 x 28: amber with an ink frame that steps amber while a deploy runs, the day count
 * on ink (on red after a failure), and the status line on its band.
 * @example
 * drawSiteSign(ctx, copy, 30, status, 256, 12);
 */
export function drawSiteSign(
  ctx: CanvasRenderingContext2D,
  copy: Copy,
  days: number,
  status: SiteStatus,
  x: number,
  y: number,
): void {
  paint(ctx, x, y, SIGN_W, 28, status.blink ? PAL.lamp : PAL.ink);
  paint(ctx, x + 1, y + 1, SIGN_W - 2, 26, status.blink ? PAL.ink : PAL.lamp);
  paint(ctx, x + 2, y + 2, SIGN_W - 4, 24, PAL.lamp);
  paint(ctx, x + 2, y + 2, 18, 12, status.alarm ? PAL.accent : PAL.ink);
  paint(ctx, x + 2, y + 15, SIGN_W - 4, 11, status.alarm ? PAL.accent : PAL.ink);

  drawSignLines(ctx, siteSignLines(copy, days, status, x, y));
}
