import { drawText } from './draw-text.ts';
import { frameAt } from './frame-at.ts';
import type { Gag } from './gag.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { stageFor } from './stage-for.ts';
import { stageSizes } from './stage-sizes.ts';
import { tagWord } from './tag-word.ts';
import { textWidth } from './text-width.ts';

const DURATION = 2200;
const SHOWN = 900;
const KEY_T = 1200;

/**
 * usage, second picture: someone used the product. A big desk calculator, its keys pressed one by one, then the
 * Event's tag on its green display. Key pose: the tag on the display.
 * @example
 * playCalculator(usageEvent, env);
 */
export const playCalculator: Gag = (event, env) => {
  const tag = tagWord(event, 36);
  const w = Math.max(19, textWidth(tag) + 8);
  const staged = stageFor(env, event, { duration: DURATION, sizes: stageSizes(event.rarity, w + 2) });
  if (staged === null) return null;

  const { box } = staged;
  const x = box.x + Math.floor((box.w - w) / 2);
  const y = box.y + box.h - 28;

  return {
    duration: DURATION,
    keyT: KEY_T,
    blinkMs: 250,
    stage: staged.spot,
    plaque: staged.plaque,
    prop: 'calculator',
    draw(ctx, t) {
      paint(ctx, x, y, w, 27, PAL.ink);
      paint(ctx, x + 1, y + 1, w - 2, 25, PAL.dusk);
      paint(ctx, x + 2, y + 2, w - 4, 8, PAL.moss);
      if (t >= SHOWN && tag !== '') drawText(ctx, tag, x + w - 4 - textWidth(tag), y + 4, PAL.glow);
      else if (t < SHOWN && frameAt(t, 200, 2) === 1) paint(ctx, x + w - 5, y + 4, 2, 5, PAL.glow);

      const pressed = t < SHOWN ? frameAt(t, 110, 9) : -1;
      const kx = x + Math.floor((w - 15) / 2);
      for (let i = 0; i < 9; i += 1)
        paint(ctx, kx + (i % 3) * 5, y + 12 + Math.floor(i / 3) * 4, 4, 3, i === pressed ? PAL.lamp : PAL.paper);
    },
  };
};
