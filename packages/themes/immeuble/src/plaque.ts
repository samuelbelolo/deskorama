import type { FreeSpot, Rect } from '@deskorama/core';
import type { PlaqueRow } from './plaque-row.ts';
import type { PlaqueWords } from './plaque-words.ts';

/** A fitted plaque: the block it holds, its rows, the actor its leader points at, and what it shows. */
export interface Plaque {
  /** The held block, in native pixels; the plaque is drawn centred in it. */
  readonly box: Rect;
  readonly rows: readonly PlaqueRow[];
  /** The actor's box in native pixels: the leader joins their nearest edges. */
  readonly anchor: Rect;
  readonly shown: PlaqueWords;
  /** The held block on the host's grid, given back when the Gag is stopped early. */
  readonly spot: FreeSpot;
}
