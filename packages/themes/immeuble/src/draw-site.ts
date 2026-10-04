import type { Copy } from './create-copy.ts';
import { craneDays } from './crane-days.ts';
import { drawCrane } from './draw-crane.ts';
import { drawDelivery } from './draw-delivery.ts';
import { drawHook } from './draw-hook.ts';
import { drawSiteSign } from './draw-site-sign.ts';
import { CRATES, drawCrates } from './draw-crates.ts';
import { drawWorks } from './draw-works.ts';
import { drawWreck } from './draw-wreck.ts';
import type { SiteGeometry } from './site-geometry.ts';
import type { SiteState } from './site-state.ts';
import { siteStatusOf } from './site-status-of.ts';

/**
 * Draws the construction site for its phase: the works, the crates and the ribbon, or the wreck; the crane, bent
 * after a failure and its beacon on while a deploy runs; and the site sign. With `still`, every moving part holds
 * one pose.
 * @example
 * drawSite(ctx, geometry, state, { copy, now, still: false });
 */
export function drawSite(
  ctx: CanvasRenderingContext2D,
  at: SiteGeometry,
  state: SiteState,
  scene: { readonly copy: Copy; readonly now: number; readonly still: boolean },
): void {
  const { now, still } = scene;
  const t = still ? 1000 + (state.phase === 'delivering' ? 1000 : 0) : now - state.since;
  const slots = state.cx - 48;

  if (state.phase === 'failed') drawWreck(ctx, at, slots);
  else if (state.phase === 'building') drawWorks(ctx, at, { cx: state.cx, t, now: still ? 0 : now });
  else if (state.delivery !== null) drawCrates(ctx, at, slots, CRATES);
  if (state.phase === 'delivering') drawDelivery(ctx, at, slots, t);

  const beacon = state.phase === 'building' && !still && Math.floor(now / 500) % 2 === 0;
  drawCrane(ctx, at, state.cx, { tilt: state.phase === 'failed' ? 6 : 0, beacon });
  if (state.phase !== 'building' && state.phase !== 'failed') drawHook(ctx, at, state.cx - 20, at.jibY + 12, false);
  drawSiteSign(
    ctx,
    scene.copy,
    craneDays(state, now),
    siteStatusOf(scene.copy, state, still ? 0 : now),
    state.cx + 6,
    at.jibY + 3,
  );
}
