import type { Rect } from '@deskorama/core';
import { drawProp } from './draw-prop.ts';
import { frameAt } from './frame-at.ts';
import { paint } from './paint.ts';
import { PAL, type Colour } from './palette.ts';

/** A rocket of the fireworks: the block it bursts in, its x, when it goes up, and its colour. */
export interface Rocket {
  readonly box: Rect;
  readonly x: number;
  readonly delay: number;
  readonly colour: Colour;
}

/** How long a rocket climbs, then how long its burst lasts, in ms. */
const CLIMB_MS = 500;
const LIFE_MS = 2600;

/**
 * Draws one rocket `t` ms after its launch: a spark climbing from the bottom of its block, then two rings of sparks
 * that open, droop and twinkle out.
 * @example
 * drawRocket(ctx, { box: { x: 60, y: 15, w: 120, h: 45 }, x: 120, delay: 0, colour: 'lamp' }, 900);
 */
export function drawRocket(ctx: CanvasRenderingContext2D, rocket: Rocket, t: number): void {
  if (t < 0 || t > LIFE_MS) return;

  const { box, x } = rocket;
  const launchY = box.y + box.h - 2;
  const burstY = box.y + Math.floor(box.h * (box.h >= 40 ? 0.4 : 0.5));

  if (t < CLIMB_MS) {
    drawProp(ctx, 'ROCKET', x, Math.round(launchY - ((launchY - burstY) * t) / CLIMB_MS));
    return;
  }

  const r = Math.min(16, Math.floor(box.h / 2) - 1, Math.floor(box.w / 2) - 2, 2 + frameAt(t - CLIMB_MS, 60));
  const fall = Math.max(0, frameAt(t - 1500, 160));

  for (let i = 0; i < 16; i += 1) {
    if (t > 2000 && (i + frameAt(t, 100)) % 2 === 1) continue;

    const a = (i / 16) * Math.PI * 2;
    paint(
      ctx,
      Math.round(x + Math.cos(a) * r),
      Math.round(burstY + Math.sin(a) * r * 0.85) + fall,
      2,
      2,
      PAL[rocket.colour],
    );
    if (i % 2 === 0 && r > 4)
      paint(
        ctx,
        Math.round(x + Math.cos(a) * (r - 4)),
        Math.round(burstY + Math.sin(a) * (r - 4) * 0.85) + fall,
        1,
        1,
        PAL.glow,
      );
  }
}
