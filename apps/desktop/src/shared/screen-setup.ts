import type { Screen } from '@deskorama/core';
import type { Scene } from './scene.ts';

/** What a wallpaper page needs to know before it draws: its screen, its neighbours, the scene and its seed. */
export interface ScreenSetup {
  /** The screen this page draws, for as long as its window lives: a display that changes gets a new window. */
  readonly screen: Screen;
  /** Every connected screen as the page opens, left to right; later changes arrive through the bridge. */
  readonly screens: readonly Screen[];
  /** The scene as the page opens; later changes arrive through the bridge. */
  readonly scene: Scene;
  /** Drawn by the main process, the only place that may read randomness from the system. */
  readonly seed: number;
}
