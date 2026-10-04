import type { Rect } from '@deskorama/core';

/**
 * What covers a MacBook's wallpaper on the demo's desktop as it opens, in screen pixels: the menu bar, an editor, a
 * terminal, a browser and the Dock. The layout every Gag must still read behind.
 */
export const DEFAULT_WINDOWS: readonly Rect[] = [
  { x: 0, y: 0, w: 1440, h: 25 },
  { x: 80, y: 60, w: 620, h: 400 },
  { x: 980, y: 80, w: 400, h: 230 },
  { x: 780, y: 360, w: 520, h: 320 },
  { x: 520, y: 836, w: 400, h: 56 },
];
