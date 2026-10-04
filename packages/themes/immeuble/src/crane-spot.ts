import type { ScreenHost } from '@deskorama/core';
import { SCALE, TILE } from './grid.ts';
import type { Layout } from './layout.ts';
import { rowY } from './row-y.ts';
import { CRANE_SPAN, JIB_LEFT } from './site-geometry.ts';

/**
 * Returns where the crane should stand for a deploy: where it is when its jib's tile row shows, else the nearest
 * visible stretch of roof that holds it, else where it is.
 * @example
 * craneSpot(host, layout, 250); // 250 when the top right of the sky shows
 */
export function craneSpot(host: ScreenHost, layout: Layout, cx: number): number {
  const y = rowY(layout, 1);
  const w = CRANE_SPAN * SCALE;
  if (host.visibleFraction({ x: (cx - JIB_LEFT) * SCALE, y, w, h: TILE }) > 0.95) return cx;

  const within = { x: 0, y, w: layout.width - 2 * TILE, h: TILE };
  const spot = host.freeSpot({ w, h: TILE, near: { x: cx * SCALE, y: y + TILE / 2 }, within });
  if (spot === null) return cx;

  return Math.max(JIB_LEFT + 4, Math.min(layout.buildingW - 76, Math.round(spot.x / SCALE) + JIB_LEFT));
}
