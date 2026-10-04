import type { Cancel, Rect, ScreenHost } from '@deskorama/core';
import type { Copy } from './create-copy.ts';
import type { Mirror } from './create-mirror.ts';
import { craneDays } from './crane-days.ts';
import { drawSite } from './draw-site.ts';
import { followBuild } from './follow-build.ts';
import { TILE } from './grid.ts';
import type { Layout } from './layout.ts';
import { mirrorSign } from './mirror-sign.ts';
import { signWords } from './sign-words.ts';
import { PARKED_X, SIGN_W, siteGeometry } from './site-geometry.ts';
import { siteSignLines } from './site-sign-lines.ts';
import type { SiteState } from './site-state.ts';
import { siteStatusOf } from './site-status-of.ts';
import { toStage } from './to-stage.ts';

/** How long the ribbon and the cheering last after a delivery. */
const DELIVERY_MS = 4200;

/** How long the crane takes to roll one native pixel along the roof. */
const ROLL_MS = 18;

/** The rooftop crane: the build state as a construction site. */
export interface Crane {
  /** Rolls along the roof and ends a delivery; true when the frame needs drawing. */
  update(now: number): boolean;
  draw(ctx: CanvasRenderingContext2D, now: number): void;
  busy(): boolean;
  dispose(): void;
}

/** What the crane of one screen draws with. */
interface CraneStage {
  readonly host: ScreenHost;
  readonly layout: Layout;
  readonly copy: Copy;
  readonly mirror: Mirror;
}

/**
 * Returns the crane of one screen. It follows the build Gauge: parked when idle, hoisting crates while a deploy
 * runs, cutting a ribbon on delivery, a still wreck with a red zero after a failure. Its site sign is reserved
 * wherever the crane stands, so no Gag covers it, and its words are mirrored.
 * @example
 * const crane = createCrane({ host, layout, copy, mirror });
 */
export function createCrane(stage: CraneStage): Crane {
  const { host, layout, copy, mirror } = stage;
  const at = siteGeometry(layout);
  const now0 = host.clock.now();
  const last = host.today().lastDeploy;
  const failedAt = last?.meta.step === 'failed' ? last.at.getTime() : null;
  const state: SiteState = { phase: 'idle', since: now0, cx: PARKED_X, targetX: PARKED_X, delivery: null, failedAt };
  let lastRoll = now0;
  let release: Cancel | null = null;
  let reservedAt = Number.NaN;
  let mirrored = '';

  const signRect = (): Rect => toStage({ x: state.cx + 6, y: at.jibY + 3, w: SIGN_W, h: 28 });

  const guard = (now: number): void => {
    const words = signWords(siteSignLines(copy, craneDays(state, now), siteStatusOf(copy, state, now), 0, 0));
    const column = Math.floor(signRect().x / TILE);
    if (words !== mirrored || column !== reservedAt) mirrorSign(mirror, 'site', signRect(), words);
    mirrored = words;
    if (column === reservedAt) return;

    release?.();
    release = host.reserve(signRect());
    reservedAt = column;
  };

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
    draw: (ctx, now) => drawSite(ctx, at, state, { copy, now, still: host.reducedMotion }),
    busy: () =>
      state.cx !== state.targetX ||
      (!host.reducedMotion && (state.phase === 'building' || state.phase === 'delivering')),
    dispose() {
      stop();
      release?.();
    },
  };
}
