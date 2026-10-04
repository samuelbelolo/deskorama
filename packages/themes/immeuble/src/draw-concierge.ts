import { blit } from './blit.ts';
import { castSprite } from './cast-sprite.ts';
import { drawText } from './draw-text.ts';
import type { Layout } from './layout.ts';
import { PAL } from './palette.ts';

/** The concierge's spot in her loge. */
const LOGE_X = 9 * 15 + 24;

/**
 * Draws the concierge in her loge: awake by day, asleep with her Zs at night.
 * @example
 * drawConcierge(ctx, layout, 14);
 */
export function drawConcierge(ctx: CanvasRenderingContext2D, layout: Layout, hour: number): void {
  const feet = layout.rdcY + 26;
  const asleep = hour < 7 || hour >= 22;
  const art = castSprite(asleep ? 'CONCIERGE_SLEEP' : 'CONCIERGE');

  blit(ctx, art, LOGE_X, feet - art.height + 1, { flip: true });
  if (!asleep) return;

  drawText(ctx, 'Z', LOGE_X + 7, feet - 15, PAL.haze);
  drawText(ctx, 'Z', LOGE_X + 10, feet - 20, PAL.zinc);
}
