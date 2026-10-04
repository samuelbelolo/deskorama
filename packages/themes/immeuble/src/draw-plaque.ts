import type { Rect } from '@deskorama/core';
import { drawText } from './draw-text.ts';
import { nearestPair } from './nearest-pair.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { plaqueRect } from './plaque-rect.ts';
import type { Plaque } from './plaque.ts';
import { rowTops } from './row-tops.ts';
import { rowWidth } from './row-width.ts';
import { textWidth } from './text-width.ts';

/** A leader longer than this is not drawn: the plaque then simply hangs where it found room. */
const LEADER_MAX = 300;

/**
 * Draws a plaque: a dotted ink leader to its actor, an ink frame on night blue, and its rows centred. The leader's
 * dots pause over `keepOff` (the signs, the other plaques), so no word ever reads as struck through.
 * @example
 * drawPlaque(ctx, plaque, [boardBox]);
 */
export function drawPlaque(ctx: CanvasRenderingContext2D, plaque: Plaque, keepOff: readonly Rect[]): void {
  const frame = plaqueRect(plaque);
  const { tops } = rowTops(plaque.rows);

  drawLeader(ctx, frame, plaque.anchor, keepOff);
  paint(ctx, frame.x, frame.y, frame.w, frame.h, PAL.ink);
  paint(ctx, frame.x + 1, frame.y + 1, frame.w - 2, frame.h - 2, PAL.night);

  plaque.rows.forEach((row, i) => {
    const x = frame.x + Math.floor((frame.w - rowWidth(row)) / 2);
    const y = frame.y + (tops[i] ?? 0);
    drawText(ctx, row.text, x, y, row.colour, row.scale);
    if (row.tail !== undefined) drawText(ctx, row.tail, x + textWidth(row.text, row.scale) + 8, y, PAL.haze);
  });
}

/**
 * Draws a dotted leader from the plaque's nearest edge to its actor's, when they are apart and within reach.
 * @example
 * drawLeader(ctx, { x: 10, y: 10, w: 40, h: 20 }, { x: 70, y: 40, w: 10, h: 10 }, []);
 */
function drawLeader(ctx: CanvasRenderingContext2D, from: Rect, to: Rect, keepOff: readonly Rect[]): void {
  const [px, qx] = nearestPair(from.x, from.x + from.w - 1, to.x, to.x + to.w - 1);
  const [py, qy] = nearestPair(from.y, from.y + from.h - 1, to.y, to.y + to.h - 1);
  const length = Math.hypot(qx - px, qy - py);
  if (length < 2 || length > LEADER_MAX) return;

  const inside = (x: number, y: number): boolean =>
    keepOff.some((k) => x >= k.x && x < k.x + k.w && y >= k.y && y < k.y + k.h);
  const steps = Math.ceil(length);
  ctx.fillStyle = PAL.ink;

  for (let i = 0; i <= steps; i += 2) {
    const x = Math.round(px + ((qx - px) * i) / steps);
    const y = Math.round(py + ((qy - py) * i) / steps);
    if (!inside(x, y)) ctx.fillRect(x, y, 1, 1);
  }
  ctx.fillRect(Math.round(qx) - 1, Math.round(qy) - 1, 2, 2);
}
