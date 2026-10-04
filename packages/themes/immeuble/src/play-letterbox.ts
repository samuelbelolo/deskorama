import { drawProp } from './draw-prop.ts';
import { drawText } from './draw-text.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { stageFor } from './stage-for.ts';
import { stageSizes } from './stage-sizes.ts';

const DURATION = 2400;
const LANDED = 1100;
const KEY_T = 1400;

/** The letterbox wall: three by three boxes, the sixth one waiting for its label. */
const COLS = 3;
const ROWS = 3;
const EMPTY = 5;

/**
 * arrival, second picture: someone or something new comes in. The building's letterbox wall appears and a new blank
 * label slides onto its one empty box, which lights up with a "+1". No name is ever written. Key pose: the new label
 * glowing with its "+1".
 * @example
 * playLetterbox(arrivalEvent, env);
 */
export const playLetterbox: Gag = (event, env) => {
  const staged = stageFor(env, event, { duration: DURATION, sizes: stageSizes(event.rarity) });
  if (staged === null) return null;

  const { box } = staged;
  const x = box.x + Math.floor((box.w - COLS * 10) / 2);
  const y = box.y + 6;
  const plusOne = env.copy.text.props.plusOne;

  return {
    duration: DURATION,
    keyT: KEY_T,
    blinkMs: 300,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'letterbox',
    draw(ctx, t) {
      drawWall(ctx, x, y);
      drawNewLabel(ctx, { x, y, right: box.x + box.w, plusOne }, t);
    },
  };
};

/**
 * Draws the wall of wooden letterboxes, each with its slot and its paper label, one without a label.
 * @example
 * drawWall(ctx, 135, 171);
 */
function drawWall(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  paint(ctx, x, y, COLS * 10, ROWS * 8, PAL.ink);

  for (let i = 0; i < COLS * ROWS; i += 1) {
    const bx = x + 1 + (i % COLS) * 10;
    const by = y + 1 + Math.floor(i / COLS) * 8;
    paint(ctx, bx, by, 9, 7, PAL.umber);
    paint(ctx, bx + 2, by + 1, 5, 1, PAL.ink);
    paint(ctx, bx + 2, by + 4, 5, 2, i === EMPTY ? PAL.wood : PAL.paper);
    if (i !== EMPTY) paint(ctx, bx + 3, by + 5, 3, 1, PAL.zinc);
  }
}

/**
 * Draws the new label sliding in from the stage's right edge onto the empty box, then the box glowing with "+1".
 * @example
 * drawNewLabel(ctx, { x: 135, y: 171, right: 180, plusOne: '+1' }, 1400);
 */
function drawNewLabel(
  ctx: CanvasRenderingContext2D,
  at: { readonly x: number; readonly y: number; readonly right: number; readonly plusOne: string },
  t: number,
): void {
  if (t < 300) return;

  const bx = at.x + 1 + (EMPTY % COLS) * 10;
  const by = at.y + 1 + Math.floor(EMPTY / COLS) * 8;
  const k = Math.min(1, (t - 300) / (LANDED - 300));
  const lx = Math.round(at.right - 6 + (bx + 2 - (at.right - 6)) * k);

  paint(ctx, lx - 1, by + 3, 7, 4, PAL.ink);
  paint(ctx, lx, by + 4, 5, 2, t >= LANDED ? PAL.glow : PAL.paper);
  if (t < LANDED) return;

  if (frameAt(t, 160, 2) === 1) drawProp(ctx, 'SPARK', bx + 7, by - 1);
  drawText(ctx, at.plusOne, bx + 1, at.y - 6, PAL.accent);
}
