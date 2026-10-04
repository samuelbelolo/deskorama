import { dither } from './dither.ts';
import { paint } from './paint.ts';
import { PAL, type Colour } from './palette.ts';

/**
 * Draws a round puff of dust or smoke, dithered at its rim.
 * @example
 * puff(ctx, 120, 40, 6);
 */
export function puff(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  core: Colour = 'haze',
  rim: Colour = 'zinc',
): void {
  for (let dy = -r; dy <= r; dy += 1) {
    const span = Math.floor(Math.sqrt(r * r - dy * dy));
    paint(ctx, cx - span, cy + dy, span * 2 + 1, 1, PAL[core]);
    if (span <= 1) continue;
    dither(ctx, cx - span, cy + dy, 2, 1, PAL[core], PAL[rim]);
    dither(ctx, cx + span - 1, cy + dy, 2, 1, PAL[core], PAL[rim]);
  }

  paint(ctx, cx - Math.floor(r / 2), cy - r, r, 1, PAL[rim]);
}
