import type { BuildState, ScreenHost, WallpaperEvent } from '@deskorama/core';
import type { Copy } from './create-copy.ts';
import { craneSpot } from './crane-spot.ts';
import type { Layout } from './layout.ts';
import { plainText } from './plain-text.ts';
import type { SiteState } from './site-state.ts';

/**
 * Moves the site to a build state: a deploy starts the works (the crane rolling to a visible stretch of roof first),
 * a deploy that went live delivers (with the ribbon when the works were on, at once after a failure), a failure
 * wrecks the site and starts the day count again. An idle site shows the last deploy that went live, if any.
 * @example
 * followBuild(state, 'building', { host, layout, copy });
 */
export function followBuild(
  state: SiteState,
  build: BuildState,
  stage: { readonly host: ScreenHost; readonly layout: Layout; readonly copy: Copy },
): void {
  const { host } = stage;
  const last = host.today().lastDeploy;
  const now = host.clock.now();

  if (build === 'building' && state.phase !== 'building') {
    state.phase = 'building';
    state.since = now;
    state.targetX = craneSpot(host, stage.layout, state.cx);
    if (host.reducedMotion) state.cx = state.targetX;
  } else if (build === 'ready' && (state.phase === 'building' || state.phase === 'failed')) {
    deliver(state, stage.copy, last, { now, ribbon: state.phase === 'building' });
  } else if (build === 'error' && state.phase !== 'failed') {
    state.phase = 'failed';
    state.since = now;
    state.failedAt = last?.meta.step === 'failed' ? last.at.getTime() : now;
    state.delivery = null;
  } else if (build === 'idle' && state.phase === 'failed' && last?.meta.step === 'succeeded') {
    deliver(state, stage.copy, last, { now, ribbon: false });
  } else if (build !== 'building' && state.phase === 'idle' && last?.meta.step === 'succeeded') {
    deliver(state, stage.copy, last, { now, ribbon: false });
  }
}

/**
 * Hands the site over: the sign says when the deploy went live and its tag; with the ribbon, it is cut first.
 * @example
 * deliver(state, copy, lastDeploy, { now, ribbon: true });
 */
function deliver(
  state: SiteState,
  copy: Copy,
  last: WallpaperEvent | null,
  at: { readonly now: number; readonly ribbon: boolean },
): void {
  state.delivery = { time: copy.time(last?.at.getTime() ?? at.now), tag: plainText(last?.meta.tag ?? '') };
  state.phase = at.ribbon ? 'delivering' : 'idle';
  state.since = at.now;
}
