import type { Cancel, ScreenHost } from '@deskorama/core';
import { drawSigns } from './draw-signs.ts';
import type { Layout } from './layout.ts';
import { placeSigns } from './place-signs.ts';
import type { Strings } from './strings.ts';

/** How long the signs wait for the windows to settle before moving, so a drag does not shake them. */
export const SIGNS_SETTLE_MS = 120;

/** The permanent signs of one screen. */
export interface Signs {
  /** Takes the signs down and gives their spot back. */
  dispose(): void;
}

/**
 * Puts up the strip of signs: it shows the Gauges as they change, reserves its spot so no Gag lands on it, and moves
 * to visible ground when windows cover its home.
 * @example
 * const signs = createSigns(root, host, textFor(host.lang), layoutFor(host.screen));
 * signs.dispose();
 */
export function createSigns(root: HTMLElement, host: ScreenHost, text: Strings, layout: Layout): Signs {
  const board = drawSigns(host.source, text, host.lang);
  root.append(board.strip);
  board.show(host.gauges());

  let release: Cancel | null = null;
  let settling: Cancel | null = null;

  const place = (): void => {
    settling = null;
    release?.();
    const rect = placeSigns(host, layout.signsHome);
    board.strip.style.transform = `translate(${rect.x}px, ${rect.y}px)`;
    release = host.reserve(rect);
  };

  place();

  const stops = [
    host.onGauges(board.show),
    host.onVisibility(() => {
      settling?.();
      settling = host.clock.after(SIGNS_SETTLE_MS, place);
    }),
  ];

  return {
    dispose() {
      for (const stop of stops) stop();
      settling?.();
      release?.();
      board.strip.remove();
    },
  };
}
