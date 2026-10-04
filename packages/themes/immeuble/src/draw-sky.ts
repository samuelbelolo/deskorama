import { blit } from './blit.ts';
import { dither } from './dither.ts';
import type { Layout } from './layout.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { skyBands } from './sky-bands.ts';
import type { SkyRow } from './sky-row.ts';
import { sprite } from './sprite.ts';

const SUN = ['..lll..', '.lgggl.', 'lgggggl', 'lgggggl', 'lgggggl', '.lgggl.', '..lll..'];
const MOON = ['.pp.', 'pph.', 'pp..', 'pph.', '.pp.'];
const CLOUD = ['....pppp......', '..pphhhhpp....', '.phhhhhhhhpp..', 'phhhhhhhhhhhhp', '.zzzzzzzzzzzz.'];

/** A fixed star field over the widest screen; the dim ones show on deep night only. */
const STARS = Array.from({ length: 48 }, (_, i) => ({
  x: (i * 97 + 13) % 440,
  y: 7 + ((i * 53) % 38),
  dim: i % 3 === 0,
}));

/** The silhouette of the famous iron tower, one two-pixel row per entry: offset from its axis and width. */
const TOWER = [
  [0, 1],
  [0, 1],
  [0, 1],
  [-1, 3],
  [-1, 3],
  [-1, 3],
  [-2, 5],
  [-2, 5],
  [-3, 7],
  [-3, 7],
  [-4, 9],
  [-5, 11],
  [-6, 13],
] as const;

/**
 * Draws the sky above the roofs for an hour: stepped bands, stars at night, the sun or the moon along its arc over
 * the whole row of screens (only where it stands over this one), slow clouds by day and the far skyline: a dome and
 * the iron tower behind the building, another dome further along the street.
 * @example
 * drawSky(ctx, layout, 3, { offset: 0, span: 360 }); // a night sky with the moon
 */
export function drawSky(ctx: CanvasRenderingContext2D, layout: Layout, hour: number, row: SkyRow): void {
  const { W, roofY } = layout;
  const bands = skyBands(hour);
  const step = Math.floor(roofY / bands.length);

  bands.forEach((name, i) => paint(ctx, 0, i * step, W, i === bands.length - 1 ? roofY - i * step : step, PAL[name]));
  const [first, second, third] = bands;
  dither(ctx, 0, step - 1, W, 2, PAL[first], PAL[second]);
  dither(ctx, 0, 2 * step - 1, W, 2, PAL[second], PAL[third]);

  const dark = bands[0] === 'night';
  if (dark) drawStars(ctx, layout, bands[1] === 'night');
  drawSunOrMoon(ctx, layout, hour, row);
  if (!dark) drawClouds(ctx, layout, hour);
  drawSkyline(ctx, layout, dark || bands[0] === 'dusk' ? PAL.dusk : PAL.zinc);
}

/**
 * Draws the star field above the block's top, shifted with it.
 * @example
 * drawStars(ctx, layout, true);
 */
function drawStars(ctx: CanvasRenderingContext2D, layout: Layout, deep: boolean): void {
  for (const star of STARS) {
    if (star.dim && !deep) continue;
    paint(ctx, star.x, star.y + layout.top, 1, 1, star.dim ? PAL.zinc : PAL.paper);
  }
}

/**
 * Draws the sun along its day arc from 6:30 to 20:00, or the moon along its night arc, across the whole row of
 * screens: nothing when it stands over another screen.
 * @example
 * drawSunOrMoon(ctx, layout, 12, { offset: 0, span: 360 }); // the sun high over the roofs
 */
function drawSunOrMoon(ctx: CanvasRenderingContext2D, layout: Layout, hour: number, row: SkyRow): void {
  const day = hour >= 6.5 && hour < 20;
  const t = day ? (hour - 6.5) / 13.5 : ((hour + 4) % 24) / 10.5;
  const x = Math.round(24 + t * (row.span - 60)) - row.offset;
  if (x < -8 || x > layout.W) return;

  const y = layout.top + 40 - Math.sin(Math.PI * Math.min(1, t)) * 30;

  if (day) blit(ctx, sprite('sun', SUN, { l: 'lamp', g: 'glow' }), x, y);
  else blit(ctx, sprite('moon', MOON, { p: 'paper', h: 'haze' }), x, y);
}

/**
 * Draws three clouds that drift one pixel every twenty minutes of the day.
 * @example
 * drawClouds(ctx, layout, 14);
 */
function drawClouds(ctx: CanvasRenderingContext2D, layout: Layout, hour: number): void {
  const cloud = sprite('cloud', CLOUD, { p: 'paper', h: 'haze', z: 'zinc' });
  const drift = Math.floor((hour * 60) / 20);

  for (const [x0, y] of [
    [30, 14],
    [170, 24],
    [290, 9],
  ] as const) {
    blit(ctx, cloud, ((x0 + drift) % (layout.W + 40)) - 20, layout.top + y);
  }
}

/**
 * Draws the far skyline peeking over the roofs: a dome, and the iron tower further on behind the building; a second
 * dome over the vacant lot next door.
 * @example
 * drawSkyline(ctx, layout, PAL.zinc);
 */
function drawSkyline(ctx: CanvasRenderingContext2D, layout: Layout, colour: string): void {
  // Next door, the dome rises over the blind wall of the vacant lot.
  const building = layout.side === 'building';
  const base = building ? layout.roofY : layout.roofY - 30;
  const domeX = building ? 66 : layout.W - 70;

  for (let i = 0; i < 9; i += 1)
    paint(ctx, domeX + i * 2 - Math.floor(i / 2), base - 9 + Math.abs(i - 4), 2, 9, colour);
  paint(ctx, domeX + 5, base - 12, 1, 3, colour);
  if (!building) return;

  TOWER.forEach(([dx, w], i) => paint(ctx, 316 + dx, base - 22 + i * 2 - (i > 0 ? 1 : 0), w, 2, colour));
  paint(ctx, 316, base - 26, 1, 4, colour);
}
