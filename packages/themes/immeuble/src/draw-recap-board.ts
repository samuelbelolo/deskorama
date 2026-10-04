import type { Rect } from '@deskorama/core';
import type { Copy } from './create-copy.ts';
import { drawText } from './draw-text.ts';
import { paint } from './paint.ts';
import { PAL } from './palette.ts';
import type { RecapLayout } from './recap-cells.ts';
import { textWidth } from './text-width.ts';

/** How far apart the cells are, top to bottom, with room for an accent; where the first one starts. */
const CELL_PITCH = 10;
const CELLS_TOP = 14;

/**
 * Returns how many cells a column of the board holds in a native height.
 * @example
 * recapRows(45); // 3
 */
export function recapRows(height: number): number {
  return Math.max(1, Math.floor((height - CELLS_TOP + CELL_PITCH - 5) / CELL_PITCH));
}

/**
 * Draws the recap board in a native box: "PENDANT TON ABSENCE" with the sum of the counts beside it, then each
 * cell's count and noun, singular or plural by the count shown. A cell shows once its count reaches 1. Returns the
 * words it shows, the title first.
 * @example
 * drawRecapBoard(ctx, copy, { x: 225, y: 180, w: 120, h: 30 }, { layout, rows: 1, counts: [1, 5, 2, 5] });
 */
export function drawRecapBoard(
  ctx: CanvasRenderingContext2D,
  copy: Copy,
  box: Rect,
  shown: { readonly layout: RecapLayout; readonly rows: number; readonly counts: readonly number[] },
): string[] {
  const { cells, columns } = shown.layout;
  const { rows } = shown;
  const title = copy.fill(copy.text.recap.title);
  const sum = String(shown.counts.reduce((total, n) => total + n, 0));

  paint(ctx, box.x, box.y + 1, box.w, box.h - 2, PAL.ink);
  paint(ctx, box.x + 1, box.y + 2, box.w - 2, box.h - 4, PAL.night);
  drawText(ctx, title, box.x + 4, box.y + 5, PAL.paper);
  drawText(ctx, sum, box.x + 8 + textWidth(title), box.y + 5, PAL.glow);

  const words = [`${title} ${sum}`];
  cells.forEach((cell, i) => {
    const n = shown.counts[i] ?? 0;
    if (n < 1) return;

    const x = box.x + 4 + (columns[Math.floor(i / rows)] ?? 0);
    const y = box.y + CELLS_TOP + (i % rows) * CELL_PITCH;
    const count = String(n);
    const noun = copy.fill(copy.plural(n, cell.noun));

    drawText(ctx, count, x + 10 - textWidth(count), y, PAL.glow);
    drawText(ctx, noun, x + 13, y, PAL.paper);
    words.push(`${count} ${noun}`);
  });

  return words;
}
