import type { Screen } from './screen.ts';

/**
 * Returns true when two reports of a screen have the same place and size, so its Theme instance can keep drawing;
 * otherwise the instance is mounted again, so the scene never stretches.
 * @example
 * sameGeometry(builtin, { ...builtin }); // true
 * sameGeometry(builtin, { ...builtin, width: 1280 }); // false
 */
export function sameGeometry(a: Screen, b: Screen): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}
