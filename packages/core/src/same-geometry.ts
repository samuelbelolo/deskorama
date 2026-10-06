import { clearHeight } from './clear-height.ts';
import type { Screen } from './screen.ts';

/**
 * Returns true when two reports of a screen have the same place, the same size and the same height clear of the
 * Dock, so its Theme instance can keep drawing; otherwise the instance is mounted again, so the scene never stretches
 * and its ground follows the Dock. A Dock that grows within one tile row of the visibility grid changes nothing.
 * @example
 * sameGeometry(builtin, { ...builtin }); // true
 * sameGeometry(builtin, { ...builtin, width: 1280 }); // false
 * sameGeometry(builtin, { ...builtin, bottomInset: 75 }); // false
 * sameGeometry({ ...builtin, bottomInset: 75 }, { ...builtin, bottomInset: 80 }); // true
 */
export function sameGeometry(a: Screen, b: Screen): boolean {
  const sameFrame = a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

  return sameFrame && clearHeight(a) === clearHeight(b);
}
