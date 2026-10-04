import { baseKey } from './base-key.ts';
import type { Renderer } from './create-renderer.ts';
import { drawBase } from './draw-base.ts';
import type { Layout } from './layout.ts';
import type { Room } from './room.ts';
import type { SkyRow } from './sky-row.ts';

/**
 * Returns what copies the still layer onto the canvas: sky, building, rooms, shops and street, redrawn into the
 * renderer's cache only when the hour's step, the arrangement of the screens or the lit rooms change.
 * @example
 * const still = createStillLayer(renderer, layout, rooms);
 * still(14, residents.litIds(), { offset: 0, span: 360 });
 */
export function createStillLayer(
  renderer: Renderer,
  layout: Layout,
  rooms: readonly Room[],
): (hour: number, lit: ReadonlySet<string>, row: SkyRow) => void {
  let drawnKey = '';

  return (hour, lit, row) => {
    const key = baseKey(hour, lit, row);
    if (key !== drawnKey) {
      drawnKey = key;
      drawBase(renderer.base, layout, { rooms, lit, hour, row });
    }

    renderer.present();
  };
}
