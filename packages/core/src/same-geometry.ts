import type { Screen } from './screen.ts';

/**
 * Returns true when two reports of a screen have the same place and size, so its layer still fits it; otherwise the
 * layer is closed and a fresh one opened, so the scene never stretches.
 * @example
 * sameGeometry(builtin, { ...builtin }); // true
 * sameGeometry(builtin, { ...builtin, width: 1280 }); // false
 * sameGeometry(builtin, { ...builtin, bottomInset: 75 }); // true: the Dock moves the ground, not the layer
 */
export function sameGeometry(a: Screen, b: Screen): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}
