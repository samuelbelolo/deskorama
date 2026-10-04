import type { Rect } from '@deskorama/core';
import { blit } from './blit.ts';
import { drawText } from './draw-text.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { portraitSprite } from './portrait-sprite.ts';

/** When the concierge starts typing, and how long each letter takes. */
const TYPE_FROM = 1500;
const LETTER_MS = 45;

/**
 * Draws the concierge's dialog box in a native box, `t` ms after the failure: a framed game dialog with her facepalm
 * portrait, her line typed out letter by letter on two rows.
 * @example
 * drawDialog(ctx, { x: 270, y: 180, w: 90, h: 30 }, ["ET C'EST MOI", 'QUI BALAIE.'], 2000);
 */
export function drawDialog(ctx: CanvasRenderingContext2D, box: Rect, line: readonly [string, string], t: number): void {
  const [first, second] = line;
  const shown = Math.max(0, Math.floor((t - TYPE_FROM) / LETTER_MS));

  paint(ctx, box.x + 1, box.y + 2, box.w - 2, box.h - 4, PAL.ink);
  paint(ctx, box.x + 2, box.y + 3, box.w - 4, box.h - 6, PAL.paper);
  paint(ctx, box.x + 3, box.y + 4, box.w - 6, box.h - 8, PAL.night);

  blit(ctx, portraitSprite(), box.x + 5, box.y + 7);
  drawText(ctx, first.slice(0, shown), box.x + 25, box.y + 8, PAL.paper);
  drawText(ctx, second.slice(0, Math.max(0, shown - first.length)), box.x + 25, box.y + 18, PAL.paper);
}
