import type { CardLayout } from './card-layout.ts';
import { drawText } from './draw-text.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import { textWidth } from './text-width.ts';

/**
 * Draws a paper card with its top-left corner at (x, y): an ink edge, a folded corner, its tag rows in ink.
 * @example
 * drawCard(ctx, 140, 170, cardLayout('#12'));
 */
export function drawCard(ctx: CanvasRenderingContext2D, x: number, y: number, card: CardLayout): void {
  const { rows, w, h } = card;

  paint(ctx, x, y, w, h, PAL.ink);
  paint(ctx, x + 1, y + 1, w - 2, h - 2, PAL.paper);
  paint(ctx, x + w - 4, y + 1, 3, 3, PAL.stone2);

  if (rows.length === 0) {
    for (let i = 0; i < 3; i += 1) paint(ctx, x + 4, y + 4 + i * 3, w - 10 - (i % 2) * 4, 1, PAL.zinc);
    return;
  }

  rows.forEach((row, i) =>
    drawText(ctx, row, x + Math.floor((w - textWidth(row)) / 2), y + (card.tops[i] ?? 5), PAL.ink),
  );
}
