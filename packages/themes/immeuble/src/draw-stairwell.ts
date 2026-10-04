import { BAY } from './grid.ts';
import type { Layout } from './layout.ts';
import { paint } from './paint.ts';
import { PAL, type Tone } from './palette.ts';

/** The stairwell's first column: it owns columns 6 to 8 of every floor. */
const STAIR_X = 6 * BAY;

/** The cast-iron lift shaft inside the stairwell. */
const SHAFT = { x: STAIR_X + 31, w: 12 } as const;

/**
 * Draws the stairwell: three flights of stairs with their handrail, and the lift's lattice shaft down to the hall.
 * @example
 * drawStairwell(ctx, layout, toner('night'));
 */
export function drawStairwell(ctx: CanvasRenderingContext2D, layout: Layout, tone: Tone): void {
  for (const row of [5, 7, 9]) {
    const top = layout.top + row * BAY + 1;
    const floor = top + 26;

    paint(ctx, STAIR_X + 1, top, 43, 26, tone('stone2'));
    paint(ctx, STAIR_X + 1, top, 43, 1, tone('umber'));

    for (let step = 0; step < 9; step += 1) {
      const sx = STAIR_X + 2 + step * 3;
      const sy = floor - (step + 1) * 3;
      paint(ctx, sx, sy, 3, floor - sy, tone('umber'));
      paint(ctx, sx, sy, 3, 1, tone('wood'));
    }

    for (let i = 0; i < 27; i += 1) paint(ctx, STAIR_X + 3 + i, floor - 6 - i, 1, 1, PAL.ink);
    paint(ctx, STAIR_X + 1, floor - 1, 43, 1, tone('wood'));
  }

  const top = layout.top + 5 * BAY + 1;
  const bottom = layout.streetY - 3;
  paint(ctx, SHAFT.x, top, SHAFT.w, bottom - top, tone('slate'));
  for (let x = SHAFT.x; x <= SHAFT.x + SHAFT.w; x += 3) paint(ctx, x, top, 1, bottom - top, PAL.ink);
  for (let y = top + 4; y < bottom; y += 8) paint(ctx, SHAFT.x, y, SHAFT.w + 1, 1, PAL.ink);
}
