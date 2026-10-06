import type { Screen } from './screen.ts';
import { TILE_SIZE } from './tile-block.ts';

/**
 * Returns how far down a screen stays clear of what the system keeps along its bottom edge: its whole height when
 * nothing is kept, else the last tile line of the visibility grid above the Dock, so what stands above that line
 * shares no tile with it.
 * @example
 * clearHeight({ id: 'builtin', x: 0, y: 0, width: 1440, height: 900 }); // 900
 * clearHeight({ id: 'builtin', x: 0, y: 0, width: 1728, height: 1117, bottomInset: 75 }); // 1020
 */
export function clearHeight(screen: Screen): number {
  const inset = screen.bottomInset ?? 0;
  if (inset <= 0) return screen.height;

  return Math.floor((screen.height - inset) / TILE_SIZE) * TILE_SIZE;
}
