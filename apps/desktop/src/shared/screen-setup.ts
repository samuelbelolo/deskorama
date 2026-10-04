import type { Screen } from '@deskorama/core';
import type { Scene } from './scene.ts';

/** What a renderer needs to know before it draws: its screen, the scene and its random seed. */
export interface ScreenSetup {
  readonly screen: Screen;
  /** The scene as the page opens; later changes arrive through the bridge. */
  readonly scene: Scene;
  /** Drawn by the main process, the only place that may read randomness from the system. */
  readonly seed: number;
}
