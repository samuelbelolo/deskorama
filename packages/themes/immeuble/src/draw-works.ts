import { drawCast } from './draw-cast.ts';
import { drawHook } from './draw-hook.ts';
import { CRATES, drawCrates } from './draw-crates.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import type { SiteGeometry } from './site-geometry.ts';

/** How long the crane takes to hoist one crate into place. */
const HOIST_MS = 2400;

/**
 * Draws a deploy under way on the roof, left of the tower: the scaffold, the crates already set, two workers
 * hammering, and the hook's cycle (down to the street side, up, across, down onto its slot).
 * @example
 * drawWorks(ctx, geometry, { cx: 250, t: 3000, now });
 */
export function drawWorks(
  ctx: CanvasRenderingContext2D,
  at: SiteGeometry,
  run: { readonly cx: number; readonly t: number; readonly now: number },
): void {
  const { roofTop, jibY } = at;
  const slots = run.cx - 48;
  const index = Math.floor(run.t / HOIST_MS);

  drawScaffold(ctx, at, slots);
  drawCrates(ctx, at, slots, Math.min(CRATES, index));

  const hammer = Math.floor(run.now / 260) % 2 === 0;
  drawCast(ctx, hammer ? 'WORKER_A' : 'WORKER_B', slots - 2, roofTop - 1);
  drawCast(ctx, hammer ? 'WORKER_B' : 'WORKER_A', slots + 20, roofTop - 13, true);

  if (index >= CRATES) {
    drawHook(ctx, at, run.cx - 20, jibY + 12, false);
    return;
  }

  const k = run.t % HOIST_MS;
  const pickX = run.cx - 12;
  const slotX = slots + 5 + index * 10;
  const step = (from: number, to: number, start: number, span: number): number =>
    Math.round(from + (to - from) * Math.min(1, Math.max(0, (k - start) / span)));

  let x = pickX;
  let y = roofTop + 22;
  if (k < 600) y = step(jibY + 12, roofTop + 22, 0, 600);
  else if (k < 1300) y = step(roofTop + 22, jibY + 8, 600, 700);
  else if (k < 1800) [x, y] = [step(pickX, slotX, 1300, 500), jibY + 8];
  else [x, y] = [slotX, step(jibY + 8, roofTop - 10, 1800, 450)];

  drawHook(ctx, at, Math.round(x / 2) * 2, Math.round(y / 2) * 2, k >= 600 && k < 2250);
}

/**
 * Draws the scaffold around the crates' slots: poles, two plank levels and a cross brace.
 * @example
 * drawScaffold(ctx, geometry, 202);
 */
function drawScaffold(ctx: CanvasRenderingContext2D, at: SiteGeometry, x: number): void {
  const { roofTop } = at;

  for (const px of [x - 3, x + 14, x + 32]) paint(ctx, px, roofTop - 22, 1, 22, PAL.umber);
  for (const py of [roofTop - 22, roofTop - 12]) {
    paint(ctx, x - 4, py, 38, 1, PAL.wood);
    paint(ctx, x - 4, py + 1, 38, 1, PAL.umber);
  }
  for (let i = 0; i < 10; i += 1) paint(ctx, x - 2 + i * 2, roofTop - 13 - i, 1, 1, PAL.umber);
}
