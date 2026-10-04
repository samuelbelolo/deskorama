import type { Rect } from '@deskorama/core';
import { arcadeLines, OVER_FROM, type ArcadeLine } from './arcade-lines.ts';
import { blit } from './blit.ts';
import type { Copy } from './create-copy.ts';
import { drawText } from './draw-text.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { portraitSprite } from './portrait-sprite.ts';
import { textWidth } from './text-width.ts';

/**
 * Draws the arcade continue screen in a native box, `t` ms after the failure, and returns the lines it shows: the
 * title in red, the countdown, the coin line blinking. When the concierge had no room for her own dialog, her
 * portrait and her line take the box over once the game is over.
 * @example
 * drawArcade(ctx, copy, { x: 225, y: 180, w: 75, h: 30 }, { t: 3000, punchline: true });
 */
export function drawArcade(
  ctx: CanvasRenderingContext2D,
  copy: Copy,
  box: Rect,
  at: { readonly t: number; readonly punchline: boolean },
): readonly string[] {
  const tall = box.h >= 40;
  const edge = tall ? 2 : 1;

  paint(ctx, box.x, box.y + 1, box.w, box.h - 2, PAL.ink);
  paint(ctx, box.x + 1, box.y + edge, box.w - 2, 1, PAL.accent);
  paint(ctx, box.x + 1, box.y + box.h - 2 * edge, box.w - 2, 1, PAL.accent);

  if (at.punchline && at.t > OVER_FROM) return drawPunchline(ctx, copy, box);

  const fits = (text: string, scale: number): boolean => textWidth(text, scale) <= box.w - 6;
  const lines = arcadeLines(copy, at.t, { tall, fits });
  const cx = box.x + Math.floor(box.w / 2);
  let y = box.y + (tall ? 7 : 8);

  lines.forEach((line: ArcadeLine, i) => {
    const hidden = line.blinks && at.t % 1000 >= 500;
    if (!hidden)
      drawText(ctx, line.text, cx - Math.floor(textWidth(line.text, line.scale) / 2), y, line.colour, line.scale);
    y += tall ? (i === 0 ? 11 : 16) : 10;
  });

  return lines.map((line) => line.text);
}

/**
 * Draws the concierge's portrait and her line inside the arcade box, and returns her line.
 * @example
 * drawPunchline(ctx, copy, { x: 225, y: 180, w: 75, h: 30 }); // ["ET C'EST MOI", "QUI BALAIE."]
 */
function drawPunchline(ctx: CanvasRenderingContext2D, copy: Copy, box: Rect): readonly string[] {
  const top = box.y + Math.floor((box.h - 16) / 2);
  const [first, second] = copy.text.concierge.line.map((line) => copy.fill(line));

  blit(ctx, portraitSprite(), box.x + 3, top);
  drawText(ctx, first ?? '', box.x + 22, top + 2, PAL.paper);
  drawText(ctx, second ?? '', box.x + 22, top + 11, PAL.paper);

  return [first ?? '', second ?? ''];
}
