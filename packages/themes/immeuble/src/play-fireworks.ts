import type { FreeSpot, Point, Rect } from '@deskorama/core';
import type { Band } from './create-placement.ts';
import { drawOutlinedText } from './draw-outlined-text.ts';
import { drawProp } from './draw-prop.ts';
import { drawRocket, type Rocket } from './draw-rocket.ts';
import { frameAt } from './frame-at.ts';
import type { Gag, GagEnv } from './gag.ts';
import { PAL, type Colour } from './palette.ts';
import { plainText } from './plain-text.ts';
import { say } from './say.ts';
import { gagSpan } from './timing.ts';
import { toNative } from './to-native.ts';

const DURATION = 5600;
const KEY_T = 2600;

/** When the trophy rises, and when it goes. */
const TROPHY = [1400, 5000] as const;

/** The rockets' colours, in turn. */
const COLOURS: readonly Colour[] = ['lamp', 'accent', 'glow', 'paper', 'dawn'];

/** Where the show looks for its main block, biggest first: the sky, else the tallest visible facade column. */
const MAIN: readonly (readonly [Band, number, number])[] = [
  ['sky', 480, 180],
  ['sky', 360, 120],
  ['facade', 120, 240],
  ['facade', 120, 180],
  ['facade', 240, 120],
  ['facade', 120, 120],
];

/**
 * celebration: a big moment, the rarest good news. A whole fireworks show: three rockets in the biggest free block
 * of sky (else the tallest visible column of the facade, never the street) and side bursts in up to three other
 * visible corners of the facade, a gold trophy twice the pixel size with the Event's tag on its plate, every empty
 * flat lit up and every tenant cheering; notable Gags wait until it ends. Key pose: the trophy over the bursts.
 * @example
 * director.play(milestoneEvent); // through gagFor(event) === playFireworks
 */
export const playFireworks: Gag = (event, env) => {
  const hold = gagSpan(DURATION);
  const main = mainBlock(env, hold);
  if (main === null) return null;

  const box = toNative(main);
  const plaque = say(env, event, box, DURATION, { avoid: [main] });
  if (plaque === null) {
    main.release();
    return null;
  }

  const also = sideBlocks(env, hold);
  const rockets = plan(box, also.map(toNative));
  const tag = plainText(event.meta.tag);
  const { width, height } = env.layout;

  return {
    duration: DURATION,
    keyT: KEY_T,
    stage: main,
    also,
    plaque,
    prop: 'trophy',
    cue: {
      at: 0,
      run(now) {
        env.party(now);
        env.cheerNear({ x: 0, y: 0, w: width, h: height }, now + 3500);
      },
    },
    draw(ctx, t) {
      for (const rocket of rockets) drawRocket(ctx, rocket, t - rocket.delay);
      if (t > TROPHY[0] && t < TROPHY[1]) drawTrophy(ctx, box, tag, t - TROPHY[0]);
    },
  };
};

/**
 * Holds the show's main block: the sky first, else the tallest visible column of the facade; null when none shows.
 * @example
 * mainBlock(env, 8100); // { x: 480, y: 60, w: 480, h: 180 } with no window
 */
function mainBlock(env: GagEnv, hold: number): FreeSpot | null {
  const near = { x: env.layout.width / 2, y: 120 };

  for (const [band, w, h] of MAIN) {
    const spot = env.place.inBand(band, { w, h, near, hold });
    if (spot !== null) return spot;
  }

  return null;
}

/**
 * Holds up to three more blocks of the facade for side bursts, one near each edge and one near the top.
 * @example
 * sideBlocks(env, 8100).length; // 3 with no window, fewer behind them
 */
function sideBlocks(env: GagEnv, hold: number): FreeSpot[] {
  const { width } = env.layout;
  const corners: readonly Point[] = [
    { x: 0, y: 300 },
    { x: width, y: 400 },
    { x: width / 2, y: 80 },
  ];

  return corners.flatMap((near) => env.place.inBand('facade', { w: 120, h: 120, near, hold }) ?? []);
}

/**
 * Lays the rockets out: three in the main block, two in each side block, staggered.
 * @example
 * plan({ x: 120, y: 15, w: 120, h: 45 }, []).length; // 3
 */
function plan(main: Rect, sides: readonly Rect[]): Rocket[] {
  const rockets: Rocket[] = [0.18, 0.5, 0.82].map((share, i) => ({
    box: main,
    x: main.x + Math.round(main.w * share),
    delay: i * 450,
    colour: COLOURS[i] ?? 'lamp',
  }));

  sides.forEach((box, i) => {
    const x = box.x + Math.round(box.w / 2);
    rockets.push({ box, x, delay: 250 + i * 380, colour: COLOURS[(i + 3) % COLOURS.length] ?? 'lamp' });
    rockets.push({ box, x, delay: 1900 + i * 300, colour: COLOURS[(i + 1) % COLOURS.length] ?? 'lamp' });
  });

  return rockets;
}

/**
 * Draws the gold trophy bobbing in the middle of the main block, twice its pixel size when the block holds it, the
 * tag on a plate under it.
 * @example
 * drawTrophy(ctx, { x: 120, y: 15, w: 120, h: 45 }, '1 000', 500);
 */
function drawTrophy(ctx: CanvasRenderingContext2D, box: Rect, tag: string, t: number): void {
  const big = box.h >= 40 || box.w >= 60 ? 2 : 1;
  const bob = frameAt(t, 250, 2);
  const cx = box.x + Math.floor(box.w / 2);
  const top = box.y + Math.floor(box.h / 2) - (big === 2 ? 17 : 10);

  drawProp(ctx, 'GOLD_CUP', cx - Math.floor((13 * big) / 2), top - bob * big, big);
  if (tag !== '') drawOutlinedText(ctx, tag, cx, top + 13 * big + 4, PAL.glow);
}
