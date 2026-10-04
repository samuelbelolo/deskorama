import { drawCast } from './draw-cast.ts';
import { drawProp } from './draw-prop.ts';
import { puff } from './puff.ts';
import { frameAt } from './frame-at.ts';
import type { LotGeometry } from './lot-geometry.ts';

/** The planks that fly off the scaffold: how far from the tower, and when. */
const PLANKS = [
  [0, 300],
  [14, 420],
  [-14, 540],
] as const;

/**
 * Draws the yard behind the hoarding giving way, `t` ms after the failure: dust over the hoarding, planks flying off
 * the scaffold, and three workers running about on the sidewalk in front of it.
 * @example
 * drawYardCollapse(ctx, lotGeometry(layout), 200, 1200);
 */
export function drawYardCollapse(ctx: CanvasRenderingContext2D, lot: LotGeometry, sidewalkY: number, t: number): void {
  const { tower, hoardY } = lot;

  if (t < 4800) {
    const r = Math.min(12, 2 + Math.floor(t / 120)) - (t > 3200 ? Math.floor((t - 3200) / 160) : 0);
    if (r > 0)
      for (const [dx, dy] of [
        [-20, 0],
        [-4, -6],
        [12, -2],
        [28, 2],
      ] as const)
        puff(ctx, tower + dx, hoardY - 8 + dy, r, 'stone', 'stone2');
  }

  for (const [dx, delay] of PLANKS) {
    const dt = t - delay;
    if (dt < 0 || dt > 1400) continue;
    const y = Math.min(hoardY - 2, hoardY - 50 + Math.round(0.00012 * dt * dt));
    drawProp(ctx, 'PLANK', tower + dx + Math.round((dx * dt) / 900), y);
  }

  if (t < 600 || t > 9000) return;
  [-30, 8, 40].forEach((dx, i) => {
    const bob = frameAt(t + i * 100, 140, 2);
    drawCast(ctx, 'WORKER_CHEER', tower + dx + ((frameAt(t, 60) + i * 17) % 20), sidewalkY - bob * 3);
  });
}
