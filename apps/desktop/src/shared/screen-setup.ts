import type { Language, Screen } from '@deskorama/core';

/** What a renderer needs to know before it draws: its screen, the display language and its random seed. */
export interface ScreenSetup {
  readonly screen: Screen;
  readonly lang: Language;
  /** Drawn by the main process, the only place that may read randomness from the system. */
  readonly seed: number;
}
