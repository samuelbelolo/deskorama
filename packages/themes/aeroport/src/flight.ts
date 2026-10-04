import type { Cancel, WallpaperEvent } from '@deskorama/core';
import type { Board } from './create-board.ts';
import type { Stage } from './stage.ts';

/** What the PROD flight plays on: a screen's stage and its board, which the failed deploy may take over. */
export type FlightStage = Stage & { readonly board: Board };

/** The PROD flight of one screen, driven by the deploy's steps. */
export interface Flight {
  /** Plays the step of a deploy Event: the line-up, the take-off, or the failed deploy. */
  readonly play: (event: WallpaperEvent) => void;
  readonly dispose: Cancel;
}

/** How long a started deploy's Caption shows: the line-up, then a while of the build. */
export const STARTED_CAPTION_MS = 9000;
