import type { ScreenHost } from '@deskorama/core';
import { BAY, SCALE, TILE } from './grid.ts';
import type { Layout } from './layout.ts';
import { rowY } from './row-y.ts';
import { CRANE_SPAN, JIB_LEFT, SIGN_W } from './site-geometry.ts';

/** The crane's leftmost and rightmost stands on the roof, its tower's x in native pixels. */
const LEFTMOST = JIB_LEFT + 4;
const RIGHT_MARGIN = 76;

/**
 * Returns where the crane should stand for a deploy: where it is when its jib's tile row shows, else the nearest
 * visible stretch of roof that holds it, else where its site sign shows best under the menu bar, else where it is.
 * @example
 * craneSpot(host, layout, 250); // 250 when the top right of the sky shows
 */
export function craneSpot(host: ScreenHost, layout: Layout, cx: number): number {
  const y = rowY(layout, 1);
  const w = CRANE_SPAN * SCALE;
  if (host.visibleFraction({ x: (cx - JIB_LEFT) * SCALE, y, w, h: TILE }) > 0.95) return cx;

  const within = { x: 0, y, w: layout.width - 2 * TILE, h: TILE };
  const spot = host.freeSpot({ w, h: TILE, near: { x: cx * SCALE, y: y + TILE / 2 }, within });
  if (spot !== null)
    return Math.max(LEFTMOST, Math.min(layout.buildingW - RIGHT_MARGIN, Math.round(spot.x / SCALE) + JIB_LEFT));

  return bestForSign(host, layout, cx);
}

/**
 * Returns the stand, bay by bay along the roof, where the most of the site sign shows under the menu bar; the
 * nearest one on a tie, and where the crane is when nowhere shows more.
 * @example
 * bestForSign(host, layout, 250); // 175 behind the default windows, the sign between the editor and the browser
 */
function bestForSign(host: ScreenHost, layout: Layout, cx: number): number {
  const shown = (x: number): number =>
    host.visibleFraction({ x: (x + 6) * SCALE, y: rowY(layout, 1), w: SIGN_W * SCALE, h: 2 * TILE });
  let best = { x: cx, score: shown(cx) };

  for (let x = LEFTMOST; x <= layout.buildingW - RIGHT_MARGIN; x += BAY) {
    const score = shown(x);
    const nearer = score === best.score && Math.abs(x - cx) < Math.abs(best.x - cx);
    if (score > best.score || nearer) best = { x, score };
  }

  return best.x;
}
