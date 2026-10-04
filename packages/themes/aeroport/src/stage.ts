import type { Cancel, ScreenHost, WallpaperEvent } from '@deskorama/core';
import type { Captions } from './create-captions.ts';
import type { Layout } from './layout.ts';
import type { Strings } from './strings.ts';

/** What a Gag plays on: one screen's root, its host, its geometry, its words and its Captions. */
export interface Stage {
  readonly root: HTMLElement;
  readonly host: ScreenHost;
  readonly layout: Layout;
  readonly text: Strings;
  readonly captions: Captions;
}

/** Plays the animation for one Event, calls `done` when it ends, and returns what stops it early. */
export type Gag = (stage: Stage, event: WallpaperEvent, done: () => void) => Cancel;
