import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { JIB_LEFT, SIGN_W, type SiteGeometry } from './site-geometry.ts';

/** How far the counter-jib reaches right of the tower, past the hanging site sign. */
const COUNTER = SIGN_W + 9;

/**
 * Draws the tower crane standing on the roof at `cx`: its lattice mast, its jib and counter-jib, the cab. A wreck
 * bends the jib down; a running deploy lights the beacon on top.
 * @example
 * drawCrane(ctx, geometry, 250, { tilt: 0, beacon: true });
 */
export function drawCrane(
  ctx: CanvasRenderingContext2D,
  at: SiteGeometry,
  cx: number,
  options: { readonly tilt: number; readonly beacon: boolean },
): void {
  const { roofTop, jibY } = at;
  const { tilt } = options;

  paint(ctx, cx - 4, roofTop - 2, 11, 2, PAL.ink);
  for (let y = jibY + 2; y < roofTop - 2; y += 1) {
    paint(ctx, cx - 1, y, 1, 1, PAL.ink);
    paint(ctx, cx + 3, y, 1, 1, PAL.ink);
    if ((y - jibY) % 4 === 0) paint(ctx, cx - 1, y, 5, 1, PAL.lamp);
    paint(ctx, cx + ((y - jibY) % 4 < 2 ? 0 : 2), y, 1, 1, PAL.lamp);
  }

  paint(ctx, cx, jibY - 6, 3, 8, PAL.ink);
  paint(ctx, cx + 1, jibY - 5, 1, 6, PAL.lamp);

  for (let x = cx - JIB_LEFT; x < cx + COUNTER; x += 1) {
    const sag = x < cx ? Math.floor(((cx - x) * tilt) / JIB_LEFT) : 0;
    paint(ctx, x, jibY + sag, 1, 1, PAL.ink);
    paint(ctx, x, jibY + 2 + sag, 1, 1, PAL.ink);
    paint(ctx, x, jibY + 1 + sag, 1, 1, x % 3 === 0 ? PAL.ink : PAL.lamp);
  }

  for (const end of [cx - JIB_LEFT, cx + COUNTER - 1]) {
    const sag = end < cx ? tilt : 0;
    for (let i = 0; i < 6; i += 1)
      paint(
        ctx,
        Math.round(cx + 1 + ((end - cx - 1) * i) / 6),
        jibY - 5 + i + Math.floor((sag * i) / 6),
        1,
        1,
        PAL.ink,
      );
  }

  paint(ctx, cx + COUNTER - 8, jibY + 3, 7, 4, PAL.slate);
  paint(ctx, cx + 4, jibY + 3, 5, 5, PAL.ink);
  paint(ctx, cx + 5, jibY + 4, 3, 2, PAL.haze);
  if (options.beacon) paint(ctx, cx + 1, jibY - 7, 1, 1, PAL.accent);
}
