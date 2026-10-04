import { drawProp } from './draw-prop.ts';
import { drawText } from './draw-text.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { puff } from './puff.ts';
import { stageFor } from './stage-for.ts';
import { stageSizes } from './stage-sizes.ts';

const DURATION = 2400;
const BROKEN = 300;
const KEY_T = 900;

/** Errors closer together than this make a burst: each one breaks the screen a little more. */
const BURST_MS = 8 * 60_000;

/** The pixels of the crack across the screen at the worst of a burst. */
const CRACK = [
  [5, 5],
  [6, 6],
  [7, 7],
  [7, 8],
  [8, 9],
  [20, 12],
  [21, 13],
  [22, 13],
] as const;

/**
 * error: something broke a little. A computer screen shows a page, then turns red with a big "!". Errors come in
 * bursts, so each one within a few minutes of the last is worse: sparks, then smoke, then a cracked screen, and its
 * sound gets louder (BIP, BZZT, AÏE). Returns the Gag of one screen, which remembers that screen's last error.
 * Key pose: the red screen with its "!".
 * @example
 * const playRedScreen = createRedScreen();
 * playRedScreen(errorEvent, env);
 */
export function createRedScreen(): Gag {
  let last: { readonly at: number; readonly level: number } | null = null;

  return (event, env) => {
    const at = event.at.getTime();
    const level = last !== null && at - last.at < BURST_MS && at >= last.at ? Math.min(4, last.level + 1) : 1;
    const sounds = env.copy.text.errors;
    const staged = stageFor(env, event, {
      duration: DURATION,
      sizes: stageSizes(event.rarity),
      sound: sounds[Math.min(level, sounds.length) - 1] ?? null,
    });
    if (staged === null) return null;

    last = { at, level };
    const { box } = staged;
    const x = box.x + Math.floor((box.w - 28) / 2);
    const y = box.y + box.h - 26;

    return {
      duration: DURATION,
      keyT: KEY_T,
      blinkMs: 250,
      stage: staged.spot,
      plaque: staged.plaque,
      prop: `red-screen-${level}`,
      draw(ctx, t) {
        drawMonitor(ctx, x, y, level, t);
      },
    };
  };
}

/**
 * Draws the monitor: a page, then the red screen and its "!", and the damage of the burst's level.
 * @example
 * drawMonitor(ctx, 136, 168, 2, 900);
 */
function drawMonitor(ctx: CanvasRenderingContext2D, x: number, y: number, level: number, t: number): void {
  paint(ctx, x, y, 28, 20, PAL.ink);
  paint(ctx, x + 1, y + 1, 26, 18, PAL.slate);
  paint(ctx, x + 12, y + 20, 4, 3, PAL.ink);
  paint(ctx, x + 8, y + 23, 12, 2, PAL.ink);

  const broken = t >= BROKEN;
  paint(ctx, x + 2, y + 2, 24, 16, broken ? PAL.accent : PAL.paper);
  paint(ctx, x + 2, y + 2, 24, 2, PAL.zinc);
  if (!broken) {
    for (let i = 0; i < 3; i += 1) paint(ctx, x + 4, y + 6 + i * 4, 12 + (i % 2) * 6, 2, PAL.denim);
    return;
  }

  if (t >= KEY_T || frameAt(t, 120, 2) === 1) drawText(ctx, '!', x + 13, y + 6, PAL.paper, 2);
  if (level >= 2 && frameAt(t, 150, 2) === 1) {
    drawProp(ctx, 'SPARK', x - 1, y - 1);
    drawProp(ctx, 'SPARK', x + 26, y + 2);
  }
  if (level >= 3) puff(ctx, x + 22, y - 2 - (frameAt(t, 200) % 3), 2, 'zinc', 'slate');
  if (level >= 4) for (const [dx, dy] of CRACK) paint(ctx, x + dx, y + dy, 1, 1, PAL.ink);
}
