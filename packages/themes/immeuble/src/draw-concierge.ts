import { blit } from './blit.ts';
import { castSprite } from './cast-sprite.ts';
import { drawOutlinedText } from './draw-outlined-text.ts';
import { drawText } from './draw-text.ts';
import type { Layout } from './layout.ts';
import { PAL } from './palette.ts';

/** The concierge's spot in her loge. */
const LOGE_X = 9 * 15 + 24;

/**
 * Draws the concierge in her loge: awake by day, asleep with her Zs at night, or shaking her head with her hand over
 * her eyes and her sigh over her head when `sigh` is given, whatever the hour.
 * @example
 * drawConcierge(ctx, layout, 14);
 * drawConcierge(ctx, layout, 3, { sigh: 'PFF', now }); // woken up by the collapse
 */
export function drawConcierge(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  hour: number,
  facepalm?: { readonly sigh: string; readonly now: number },
): void {
  const feet = layout.rdcY + 26;

  if (facepalm !== undefined) {
    const art = castSprite('CONCIERGE_FACEPALM');
    blit(ctx, art, LOGE_X, feet - art.height + 1, { flip: Math.floor(facepalm.now / 300) % 2 === 0 });
    drawOutlinedText(ctx, facepalm.sigh, LOGE_X + 3, feet - 19, PAL.paper);
    return;
  }

  const asleep = hour < 7 || hour >= 22;
  const art = castSprite(asleep ? 'CONCIERGE_SLEEP' : 'CONCIERGE');

  blit(ctx, art, LOGE_X, feet - art.height + 1, { flip: true });
  if (!asleep) return;

  drawText(ctx, 'Z', LOGE_X + 7, feet - 15, PAL.haze);
  drawText(ctx, 'Z', LOGE_X + 10, feet - 20, PAL.zinc);
}
