import { LIT } from './lit.ts';
import type { Colour, Tone } from './palette.ts';

/** Pixel maps already rendered, by name and tone: a sprite is drawn into its small canvas once. */
const CACHE = new Map<string, HTMLCanvasElement>();

/** Which colour each character of a pixel map stands for; any other character is transparent. */
export type Legend = Readonly<Record<string, Colour>>;

/**
 * Returns a pixel map rendered into a small canvas, built on first use for a name and a tone and kept.
 * @example
 * sprite('heart', ['.k.', 'kak'], { k: 'ink', a: 'accent' }); // a 3 x 2 canvas
 * sprite('bed', BED, LEGEND, dimToner('night'), 'night'); // the same bed, unlit
 */
export function sprite(
  name: string,
  rows: readonly string[],
  legend: Legend,
  tone: Tone = LIT,
  toneName = 'day',
): HTMLCanvasElement {
  const key = `${name}|${toneName}`;
  const cached = CACHE.get(key);
  if (cached !== undefined) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, ...rows.map((row) => row.length));
  canvas.height = Math.max(1, rows.length);
  const ctx = canvas.getContext('2d');

  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      const colour = legend[row.charAt(x)];
      if (colour === undefined || ctx === null) continue;
      ctx.fillStyle = tone(colour);
      ctx.fillRect(x, y, 1, 1);
    }
  });

  CACHE.set(key, canvas);

  return canvas;
}
