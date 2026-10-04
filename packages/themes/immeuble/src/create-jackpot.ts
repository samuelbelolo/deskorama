import type { Cancel, FreeSpot, WallpaperEvent } from '@deskorama/core';
import type { Ambient } from './create-ambient.ts';
import type { Mirror } from './create-mirror.ts';
import type { Plaques } from './create-plaques.ts';
import type { Site } from './create-site.ts';
import { drawArcade } from './draw-arcade.ts';
import { drawDialog } from './draw-dialog.ts';
import { drawOutlinedText } from './draw-outlined-text.ts';
import type { GagEnv } from './gag.ts';
import { TILE } from './grid.ts';
import { jackpotShouts, type TimedShout } from './jackpot-shouts.ts';
import { PAL } from './palette.ts';
import { placeArcade } from './place-arcade.ts';
import { rowY } from './row-y.ts';
import { say } from './say.ts';
import { plaqueSpan } from './timing.ts';
import { toNative } from './to-native.ts';
import { toStage } from './to-stage.ts';

/** How long the scene plays, and its key instant: the dust up, the red zero, the countdown on, the line typed. */
export const JACKPOT_MS = 12_200;
const KEY_T = 3200;

/** How long the failure's plaque hangs by the site sign: the whole collapse. */
const PLAQUE_MS = 9000;

/** The boxes still missing are looked for this often, until this late in the scene. */
const RETRY_MS = 500;
const RETRY_UNTIL = 7000;

/** When the concierge's dialog shows, in ms after the failure. */
const DIALOG = [1200, 8500] as const;

/** The failed-deploy scene of one screen. */
export interface Jackpot {
  /** Plays the failed deploy now, whatever plays already: it never waits for room. */
  play(event: WallpaperEvent): void;
  draw(ctx: CanvasRenderingContext2D, now: number): void;
  busy(now: number): boolean;
  dispose(): void;
}

/** What the scene plays with on one screen. */
interface JackpotStage {
  readonly env: GagEnv;
  readonly ambient: Ambient;
  readonly site: Site;
  readonly plaques: Plaques;
  readonly mirror: Mirror;
}

/** One run of the scene: when it began, the boxes it holds, its shouts, and what takes it all down. */
interface Run {
  readonly start: number;
  readonly shouts: readonly TimedShout[];
  readonly stops: Cancel[];
  arcade: FreeSpot | null;
  dialog: FreeSpot | null;
  said: string;
  tried: number;
}

/**
 * Returns the failed-deploy scene of one screen, the jackpot: the site gives way with a crack (the crane on the roof,
 * or the yard next door), the sign drops to a red zero, the whole building blacks out and relights floor by floor
 * with every tenant alarmed, the screen jolts, the concierge facepalms and says her line, and an arcade box counts
 * down to the end of the game. It plays at once on every screen; the boxes it finds no room for yet are looked for
 * again while it plays, and every word it draws is mirrored.
 * @example
 * const jackpot = createJackpot({ env, ambient, site, plaques, mirror });
 * jackpot.play(deployFailed);
 */
export function createJackpot(stage: JackpotStage): Jackpot {
  const { env } = stage;
  const { host } = env;
  let run: Run | null = null;

  const end = (): void => {
    for (const stop of run?.stops ?? []) stop();
    run = null;
  };

  return {
    play(event) {
      end();
      const now = host.clock.now();
      const shouts = jackpotShouts(host, env.copy, { sign: stage.site.signBox(), hanging: stage.site.hanging() });
      const current: Run = { start: now, shouts, stops: [], arcade: null, dialog: null, said: '', tried: -Infinity };
      run = current;

      react(stage, now);
      current.stops.push(hangPlaque(stage, event, now), host.clock.after(JACKPOT_MS, end));
      shouts.forEach((shout, i) => current.stops.push(mirrorShout(stage.mirror, shout, i)));
      if (env.layout.side === 'building') holdLoge(stage, current);
      look(stage, current, now);
    },
    draw(ctx, now) {
      if (run === null) return;

      look(stage, run, now);
      drawRun(ctx, stage, run, host.reducedMotion ? KEY_T : now - run.start);
    },
    busy: (now) => run !== null && now - run.start < JACKPOT_MS,
    dispose: end,
  };
}

/**
 * Sets the whole building reacting at a Clock time: the blackout, the tenants alarmed, the concierge's facepalm and
 * the jolt. Each reaction ends by itself.
 * @example
 * react(stage, now);
 */
function react(stage: JackpotStage, now: number): void {
  stage.ambient.lights.blackout(now);
  stage.ambient.residents.alarm(now + 3600);
  stage.ambient.facepalm(now + 8000);
  stage.env.shake(2, 700);
}

/**
 * Hangs the failure's plaque by the site sign for the whole collapse; returns what takes it down.
 * @example
 * hangPlaque(stage, deployFailed, now);
 */
function hangPlaque(stage: JackpotStage, event: WallpaperEvent, now: number): Cancel {
  const sign = stage.site.signBox();
  const plaque = say(stage.env, event, sign, PLAQUE_MS, { avoid: [toStage(sign)] });
  if (plaque === null) return () => {};

  return stage.plaques.add(plaque, event, now + plaqueSpan(PLAQUE_MS));
}

/**
 * Mirrors a shout of the collapse over its box for the scene's run; returns what removes it.
 * @example
 * mirrorShout(mirror, shout, 0);
 */
function mirrorShout(mirror: Mirror, shout: TimedShout, index: number): Cancel {
  return mirror.set(`shout-${index}`, {
    box: toStage(shout.box),
    data: { part: 'shout' },
    parts: [['shout-text', shout.text]],
  });
}

/**
 * Holds the loge for the scene, so no Gag covers the concierge facepalming; nothing when a Gag plays there already.
 * @example
 * holdLoge(stage, run);
 */
function holdLoge(stage: JackpotStage, run: Run): void {
  const loge = stage.env.place.exact({ x: 9 * TILE, y: rowY(stage.env.layout, 11), w: 180, h: 120 }, JACKPOT_MS);
  if (loge !== null) run.stops.push(() => loge.release());
}

/**
 * Looks again for the boxes the run still lacks, now and then while it plays: the arcade box first, then the
 * concierge's dialog in the building, each held to the end of the scene and mirrored.
 * @example
 * look(stage, run, now);
 */
function look(stage: JackpotStage, run: Run, now: number): void {
  if (now - run.tried < RETRY_MS || now - run.start > RETRY_UNTIL) return;
  run.tried = now;

  const { env, mirror } = stage;
  const hold = run.start + JACKPOT_MS - now;

  if (run.arcade === null) {
    run.arcade = placeArcade(env, hold);
    const arcade = run.arcade;
    if (arcade !== null) run.stops.push(() => arcade.release());
  }

  if (env.layout.side !== 'building' || run.arcade === null || run.dialog !== null) return;

  const dialog = env.place.anywhere({ w: 360, h: 120, near: { x: 900, y: 600 }, hold });
  if (dialog === null) return;

  run.dialog = dialog;
  const line = env.copy.text.concierge.line.map((text) => env.copy.fill(text)).join(' ');
  const unmirror = mirror.set('concierge', {
    box: dialog,
    data: { part: 'concierge' },
    parts: [['concierge-line', line]],
  });
  run.stops.push(() => dialog.release(), unmirror);
}

/**
 * Draws one instant of a run, `t` ms after the failure: the site giving way, the shouts, the concierge's dialog and
 * the arcade box, whose words are mirrored as they change.
 * @example
 * drawRun(ctx, stage, run, 3200);
 */
function drawRun(ctx: CanvasRenderingContext2D, stage: JackpotStage, run: Run, t: number): void {
  const { env, mirror } = stage;
  stage.site.drawCollapse(ctx, t);

  for (const shout of run.shouts)
    if (t >= shout.from && t < shout.to) drawOutlinedText(ctx, shout.text, shout.cx, shout.y, PAL.paper, shout.scale);

  const [first, second] = env.copy.text.concierge.line;
  if (run.dialog !== null && t > DIALOG[0] && t < DIALOG[1])
    drawDialog(ctx, toNative(run.dialog), [env.copy.fill(first), env.copy.fill(second)], t);

  if (run.arcade === null) return;

  const said = drawArcade(ctx, env.copy, toNative(run.arcade), { t, punchline: run.dialog === null });
  const words = said.join(' ');
  if (words === run.said) return;

  const unmirrored = run.said === '';
  run.said = words;
  const unmirror = mirror.set('arcade', {
    box: run.arcade,
    data: { part: 'arcade' },
    parts: said.map((text) => ['arcade-line', text] as const),
  });
  if (unmirrored) run.stops.push(unmirror);
}
