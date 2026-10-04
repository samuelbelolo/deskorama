import { drawCast } from './draw-cast.ts';
import { drawProp } from './draw-prop.ts';
import { puff } from './puff.ts';
import { frameAt } from './frame-at.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import type { SiteGeometry } from './site-geometry.ts';

/** The pieces that tumble down the facade: what they are, how far right of the crates' slots, and when they go. */
const PIECES = [
  ['CRATE', 0, 200],
  ['PLANK', 6, 120],
  ['CRATE', 10, 350],
  ['PLANK', 18, 260],
  ['CRATE', 20, 480],
] as const;

/** The swing of the worker left hanging from the hook, a native pixel at a time. */
const SWING = [0, 1, 2, 1, 0, -1, -2, -1] as const;

/**
 * Draws the rooftop site giving way, `t` ms after the failure: a dust cloud swelling over the roof, crates and planks
 * tumbling down the facade onto the sidewalk, three workers running in circles, and one left hanging from the hook.
 * @example
 * drawRoofCollapse(ctx, geometry, { cx: 250, sidewalkY: 200 }, 1500);
 */
export function drawRoofCollapse(
  ctx: CanvasRenderingContext2D,
  at: SiteGeometry,
  site: { readonly cx: number; readonly sidewalkY: number },
  t: number,
): void {
  const slots = site.cx - 48;

  drawDust(ctx, slots, at.roofTop, t);
  drawFalling(ctx, slots, { roofTop: at.roofTop, sidewalkY: site.sidewalkY }, t);
  if (t < 500 || t > 9800) return;

  [0, 41, 83].forEach((offset, i) => {
    const phase = (frameAt(t, 30) + offset) % 120;
    const x = slots - 22 + (phase < 60 ? phase : 120 - phase);
    drawCast(ctx, frameAt(t + i * 60, 120, 2) === 1 ? 'WORKER_CHEER' : 'WORKER_B', x, at.roofTop - 1, phase >= 60);
  });

  const swing = SWING[frameAt(t, 140, SWING.length)] ?? 0;
  paint(ctx, site.cx - 20, at.jibY + 5, 1, 14, PAL.ink);
  drawCast(ctx, 'WORKER_CHEER', site.cx - 22 + swing, at.jibY + 28);
}

/**
 * Draws the dust cloud swelling over the roof, then thinning out and rising.
 * @example
 * drawDust(ctx, 202, 52, 1500);
 */
function drawDust(ctx: CanvasRenderingContext2D, slots: number, roofTop: number, t: number): void {
  if (t < 150 || t > 5200) return;

  const r = Math.min(10, 2 + Math.floor((t - 150) / 110)) - (t > 3400 ? Math.floor((t - 3400) / 180) : 0);
  if (r < 1) return;

  for (const [dx, dy, lag] of [
    [-8, 2, 0],
    [6, -3, 2],
    [20, 0, 1],
    [34, -2, 3],
    [48, 3, 2],
  ] as const)
    puff(ctx, slots + dx, roofTop - 6 + dy - Math.floor(t / 900), Math.max(1, r - lag), 'stone', 'stone2');
}

/**
 * Draws the crates and planks falling down the facade, then their wreck on the sidewalk.
 * @example
 * drawFalling(ctx, 202, { roofTop: 52, sidewalkY: 200 }, 600);
 */
function drawFalling(
  ctx: CanvasRenderingContext2D,
  slots: number,
  ground: { readonly roofTop: number; readonly sidewalkY: number },
  t: number,
): void {
  for (const [name, dx, delay] of PIECES) {
    const dt = t - delay;
    if (dt < 0) continue;

    const floor = ground.sidewalkY - (name === 'CRATE' ? 7 : 1);
    const y = Math.min(floor, Math.round((ground.roofTop - 10 + 0.0002 * dt * dt) / 2) * 2);
    const x = slots + dx + Math.round((dx - 10) * Math.min(1, dt / 900) * 0.8);

    if (y < floor) drawProp(ctx, name, x, y);
    else if (name === 'CRATE') drawProp(ctx, 'RUBBLE', x, floor + 3);
    else drawProp(ctx, 'PLANK', x, floor);
  }
}
