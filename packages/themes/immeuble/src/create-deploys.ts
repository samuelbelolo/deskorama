import type { WallpaperEvent } from '@deskorama/core';
import type { Ambient } from './create-ambient.ts';
import { createJackpot } from './create-jackpot.ts';
import type { Mirror } from './create-mirror.ts';
import type { Plaques } from './create-plaques.ts';
import type { Site } from './create-site.ts';
import { deployStepOf } from './deploy-step-of.ts';
import type { GagEnv } from './gag.ts';
import { say } from './say.ts';
import { plaqueSpan } from './timing.ts';
import { toStage } from './to-stage.ts';

/** How long a started or delivered deploy's plaque hangs by the site sign, before its late glance. */
const STEP_MS = 4000;

/** The deploys of one screen, played outside the Gags' waiting line. */
export interface Deploys {
  /** Plays a deploy step: its plaque by the site sign, or the jackpot for a failure. */
  play(event: WallpaperEvent): void;
  draw(ctx: CanvasRenderingContext2D, now: number): void;
  busy(now: number): boolean;
  dispose(): void;
}

/**
 * Returns the deploys of one screen. Deploys reach every screen at once and the build Gauge has already moved the
 * site when their Event lands, so a step only hangs its plaque by the site sign, in the Event's own words; a failed
 * deploy plays the jackpot, which never waits for room. Deploys never queue behind a Gag.
 * @example
 * const deploys = createDeploys({ env, ambient, site, plaques, mirror });
 * host.onEvent((event) => event.archetype === 'deploy' && deploys.play(event));
 */
export function createDeploys(stage: {
  readonly env: GagEnv;
  readonly ambient: Ambient;
  readonly site: Site;
  readonly plaques: Plaques;
  readonly mirror: Mirror;
}): Deploys {
  const { env, site, plaques } = stage;
  const jackpot = createJackpot(stage);

  return {
    play(event) {
      if (deployStepOf(event) === 'failed') {
        jackpot.play(event);
        return;
      }

      const sign = site.signBox();
      const plaque = say(env, event, sign, STEP_MS, { avoid: [toStage(sign)] });
      if (plaque !== null) plaques.add(plaque, event, env.host.clock.now() + plaqueSpan(STEP_MS));
    },
    draw: (ctx, now) => jackpot.draw(ctx, now),
    busy: (now) => jackpot.busy(now),
    dispose: () => jackpot.dispose(),
  };
}
