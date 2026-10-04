import type { Copy } from './create-copy.ts';
import { drawConcierge } from './draw-concierge.ts';
import type { Layout } from './layout.ts';

/** The concierge of one screen's building; next door has none. */
export interface Concierge {
  /** Makes her shake her head, her hand over her eyes, until a Clock time. */
  facepalm(until: number): void;
  /** True while she reacts. */
  busy(now: number): boolean;
  draw(ctx: CanvasRenderingContext2D, hour: number, now: number): void;
}

/**
 * Returns the concierge in her loge: awake by day, asleep at night, and facepalming with a sigh when she is told to;
 * held still under reduced motion. Next door, where there is no loge, she draws nothing.
 * @example
 * const concierge = createConcierge(layout, copy, false);
 * concierge.facepalm(clock.now() + 8000);
 */
export function createConcierge(layout: Layout, copy: Copy, still: boolean): Concierge {
  let until = Number.NEGATIVE_INFINITY;

  return {
    facepalm(time) {
      until = time;
    },
    busy: (now) => now < until,
    draw(ctx, hour, now) {
      if (layout.side !== 'building') return;

      const sigh = now < until ? { sigh: copy.text.concierge.sigh, now: still ? 0 : now } : undefined;
      drawConcierge(ctx, layout, hour, sigh);
    },
  };
}
