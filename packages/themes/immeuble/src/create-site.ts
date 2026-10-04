import type { Rect, ScreenHost } from '@deskorama/core';
import type { Copy } from './create-copy.ts';
import type { Mirror } from './create-mirror.ts';
import { createSignGuard } from './create-sign-guard.ts';
import { drawRoofCollapse } from './draw-roof-collapse.ts';
import { drawSite } from './draw-site.ts';
import { drawYard } from './draw-yard.ts';
import { drawYardCollapse } from './draw-yard-collapse.ts';
import { followBuild } from './follow-build.ts';
import type { Layout } from './layout.ts';
import { lotGeometry } from './lot-geometry.ts';
import { PARKED_X, SIGN_W, siteGeometry } from './site-geometry.ts';
import type { SiteState } from './site-state.ts';
import { toStage } from './to-stage.ts';

/** How long the ribbon and the cheering last after a delivery. */
const DELIVERY_MS = 4200;

/** How long the crane takes to roll one native pixel along the roof. */
const ROLL_MS = 18;

/** The construction site of one screen: the build state as a crane on the roof, or a yard behind a hoarding. */
export interface Site {
  /** Rolls along the roof and ends a delivery; true when the frame needs drawing. */
  update(now: number): boolean;
  draw(ctx: CanvasRenderingContext2D, now: number): void;
  /** Draws the site giving way, `t` ms after a failed deploy. */
  drawCollapse(ctx: CanvasRenderingContext2D, t: number): void;
  /** Where the site sign hangs once the crane has rolled, in native pixels: what a deploy's plaque points at. */
  signBox(): Rect;
  /** Where the worker left hanging from the hook is, in native pixels; null for a yard, which has no hook. */
  hanging(): Rect | null;
  busy(): boolean;
  dispose(): void;
}

/** What the site of one screen draws with. */
interface SiteStage {
  readonly host: ScreenHost;
  readonly layout: Layout;
  readonly copy: Copy;
  readonly mirror: Mirror;
}

/**
 * Returns the construction site of one screen. It follows the build Gauge: idle, works while a deploy runs, a ribbon
 * on delivery, a wreck with a red zero after a failure. The building has a tower crane on its roof, which rolls to
 * where the roof shows; next door, the same deploy is a yard behind the hoarding. The site sign is reserved wherever
 * it hangs, so no Gag covers it, and its words are mirrored.
 * @example
 * const site = createSite({ host, layout, copy, mirror });
 */
export function createSite(stage: SiteStage): Site {
  const { host, layout, copy, mirror } = stage;
  const roof = siteGeometry(layout);
  const lot = lotGeometry(layout);
  const building = layout.side === 'building';
  const now0 = host.clock.now();
  const last = host.today().lastDeploy;
  const failedAt = last?.meta.step === 'failed' ? last.at.getTime() : null;
  const x0 = building ? PARKED_X : lot.tower;
  const state: SiteState = { phase: 'idle', since: now0, cx: x0, targetX: x0, delivery: null, failedAt };
  const signGuard = createSignGuard(host, copy, mirror);
  let lastRoll = now0;

  const signAt = (x: number): Rect => (building ? { x: x + 6, y: roof.jibY + 3, w: SIGN_W, h: 28 } : lot.sign);
  const guard = (now: number): void => signGuard.keep(toStage(signAt(state.cx)), state, now);

  const follow = (): void => {
    followBuild(state, host.gauges().build, stage);
    guard(host.clock.now());
  };

  follow();
  const stop = host.onGauges(follow);

  return {
    update(now) {
      if (state.phase === 'delivering' && now - state.since > DELIVERY_MS) state.phase = 'idle';
      const steps = Math.min(Math.abs(state.targetX - state.cx), Math.floor((now - lastRoll) / ROLL_MS));
      if (steps === 0) {
        if (state.cx === state.targetX) lastRoll = now;
        guard(now);
        return false;
      }

      state.cx += Math.sign(state.targetX - state.cx) * steps;
      lastRoll = now;
      guard(now);
      return true;
    },
    draw(ctx, now) {
      const scene = { copy, now, still: host.reducedMotion };
      if (building) drawSite(ctx, roof, state, scene);
      else drawYard(ctx, lot, state, scene);
    },
    drawCollapse(ctx, t) {
      if (building) drawRoofCollapse(ctx, roof, { cx: state.cx, sidewalkY: layout.sidewalkY }, t);
      else drawYardCollapse(ctx, lot, layout.sidewalkY, t);
    },
    signBox: () => signAt(state.targetX),
    hanging: () => (building ? { x: state.cx - 24, y: roof.jibY + 18, w: 11, h: 11 } : null),
    busy: () =>
      state.cx !== state.targetX ||
      (!host.reducedMotion && (state.phase === 'building' || state.phase === 'delivering')),
    dispose() {
      stop();
      signGuard.release();
    },
  };
}
