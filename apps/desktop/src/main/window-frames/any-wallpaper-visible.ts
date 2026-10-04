import { createRandom, createVisibleMap, type Clock, type Rect, type Screen } from '@deskorama/core';

/**
 * Returns true when some part of some screen's wallpaper is visible, on the engine's grid of 60 px tiles.
 * @example
 * anyWallpaperVisible([builtin], [{ x: 0, y: 0, w: 1728, h: 1117 }], clock); // false, all covered
 */
export function anyWallpaperVisible(screens: readonly Screen[], frames: readonly Rect[], clock: Clock): boolean {
  return screens.some((screen) => {
    // The map's random generator only places free spots, which are not asked for here.
    const map = createVisibleMap(screen, clock, createRandom(0));

    map.update(frames);

    return !map.isHidden();
  });
}
