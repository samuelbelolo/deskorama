import type { Copy } from './create-copy.ts';
import { craneDays } from './crane-days.ts';
import { drawCast } from './draw-cast.ts';
import { drawProp } from './draw-prop.ts';
import { drawSiteSign } from './draw-site-sign.ts';
import { frameAt } from './frame-at.ts';
import type { LotGeometry } from './lot-geometry.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import type { SiteState } from './site-state.ts';
import { siteStatusOf } from './site-status-of.ts';

/**
 * Draws the yard behind the hoarding next door for its phase, the same deploy as the crane's next door: a scaffold
 * tower with two workers hoisting a crate while a deploy runs, the delivered crates after, rubble after a failure;
 * then the site sign on the hoarding. With `still`, every moving part holds one pose.
 * @example
 * drawYard(ctx, lotGeometry(layout), state, { copy, now, still: false });
 */
export function drawYard(
  ctx: CanvasRenderingContext2D,
  lot: LotGeometry,
  state: SiteState,
  scene: { readonly copy: Copy; readonly now: number; readonly still: boolean },
): void {
  const { tower, hoardY } = lot;
  const now = scene.still ? 0 : scene.now;
  const t = scene.still ? 1500 : scene.now - state.since;

  if (state.phase === 'failed') {
    for (const dx of [-26, -12, 4]) drawProp(ctx, 'RUBBLE', tower + dx, hoardY - 4);
  } else if (state.phase === 'building' || state.phase === 'delivering') {
    drawTower(ctx, lot);
    const swing = frameAt(now, 260, 2) === 0;
    const cheer = state.phase === 'delivering' && t > 900 && swing;
    drawCast(ctx, cheer || !swing ? 'WORKER_CHEER' : 'WORKER_A', tower - 2, hoardY - 27);
    drawCast(ctx, swing ? 'WORKER_B' : 'WORKER_A', tower + 12, hoardY - 47, true);
    if (state.phase === 'building') drawProp(ctx, 'CRATE', tower + 22, hoardY - 30 - frameAt(t, 120, 16));
  }

  if (state.delivery !== null && state.phase !== 'building' && state.phase !== 'failed') {
    for (let i = 0; i < 3; i += 1) drawProp(ctx, 'CRATE', tower - 20 + i * 10, hoardY - 9);
    drawProp(ctx, 'CRATE', tower - 15, hoardY - 17);
  }

  const { sign } = lot;
  drawSiteSign(ctx, scene.copy, craneDays(state, scene.now), siteStatusOf(scene.copy, state, now), sign.x, sign.y);
}

/**
 * Draws the scaffold tower standing in the lot, its platforms showing over the hoarding.
 * @example
 * drawTower(ctx, lotGeometry(layout));
 */
function drawTower(ctx: CanvasRenderingContext2D, lot: LotGeometry): void {
  const { tower, hoardY } = lot;

  for (const x of [tower - 4, tower + 20]) paint(ctx, x, hoardY - 58, 1, 58, PAL.umber);
  for (const y of [hoardY - 38, hoardY - 18]) {
    paint(ctx, tower - 6, y, 30, 2, PAL.wood);
    paint(ctx, tower - 6, y + 1, 30, 1, PAL.umber);
  }

  for (let i = 0; i < 18; i += 1) paint(ctx, tower - 3 + i, hoardY - 20 - i, 1, 1, PAL.umber);
  paint(ctx, tower + 22, hoardY - 58, 1, 28, PAL.ink);
}
