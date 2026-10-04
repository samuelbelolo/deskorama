import { baseKey } from './base-key.ts';
import type { Renderer } from './create-renderer.ts';
import { drawBase } from './draw-base.ts';
import type { Layout } from './layout.ts';
import type { Room } from './room.ts';

/**
 * Returns what copies the still layer onto the canvas: sky, building, rooms, shops and street, redrawn into the
 * renderer's cache only when the hour's step or the lit rooms change.
 * @example
 * const still = createStillLayer(renderer, layout, rooms);
 * still(14, residents.litIds());
 */
export function createStillLayer(
  renderer: Renderer,
  layout: Layout,
  rooms: readonly Room[],
): (hour: number, lit: ReadonlySet<string>) => void {
  let drawnKey = '';

  return (hour, lit) => {
    const key = baseKey(hour, lit);
    if (key !== drawnKey) {
      drawnKey = key;
      drawBase(renderer.base, layout, { rooms, lit, hour });
    }

    renderer.present();
  };
}
