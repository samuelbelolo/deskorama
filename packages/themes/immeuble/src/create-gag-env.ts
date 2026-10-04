import type { Rect, ScreenHost } from '@deskorama/core';
import type { Ambient } from './create-ambient.ts';
import type { Copy } from './create-copy.ts';
import { createPlacement } from './create-placement.ts';
import type { Renderer } from './create-renderer.ts';
import type { GagEnv } from './gag.ts';
import type { Layout } from './layout.ts';

/** How far around a Gag's stage, in screen pixels, the tenants of lit rooms hear it and cheer. */
const EARSHOT = 60;

/**
 * Returns true when two screen rectangles are within earshot of each other.
 * @example
 * near({ x: 0, y: 0, w: 60, h: 60 }, { x: 100, y: 0, w: 60, h: 60 }); // true
 */
function near(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w + EARSHOT && b.x - EARSHOT < a.x + a.w && a.y < b.y + b.h + EARSHOT && b.y - EARSHOT < a.y + a.h
  );
}

/**
 * Returns what every Gag of one screen plays with: placement, words, the tenants, the shake (still under reduced
 * motion) and the cheer of the neighbours.
 * @example
 * const env = createGagEnv({ host, layout, copy, renderer, ambient });
 */
export function createGagEnv(stage: {
  readonly host: ScreenHost;
  readonly layout: Layout;
  readonly copy: Copy;
  readonly renderer: Renderer;
  readonly ambient: Ambient;
}): GagEnv {
  const { host, layout, copy, renderer, ambient } = stage;
  return {
    host,
    layout,
    copy,
    place: createPlacement(host, layout),
    flats() {
      const lit = ambient.residents.litIds();
      return ambient.rooms.filter((room) => room.rows === 2).map((room) => ({ room, lit: lit.has(room.id) }));
    },
    shake(pixels, ms) {
      if (!host.reducedMotion) renderer.shake(pixels, host.clock.now() + ms);
    },
    cheerNear(rect, until) {
      const lit = ambient.residents.litIds();
      for (const room of ambient.rooms)
        if (lit.has(room.id) && near(room.stage, rect)) ambient.residents.cheer(room.id, until);
    },
  };
}
