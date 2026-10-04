import type { Screen } from '@deskorama/core';
import { SCALE } from './grid.ts';

/** Where a screen sits in the row of screens, in native pixels: one sky over all of them. */
export interface SkyRow {
  /** How far the screen's left edge is from the row's left edge. */
  readonly offset: number;
  /** The row's whole width. */
  readonly span: number;
}

/**
 * Returns where a screen sits in the row of connected screens, so the sun and the moon cross the whole row once and
 * show only on the screen they are over.
 * @example
 * skyRow(builtin, [builtin, external]); // { offset: 0, span: 760 }
 * skyRow(external, [builtin, external]); // { offset: 360, span: 760 }
 */
export function skyRow(own: Screen, screens: readonly Screen[]): SkyRow {
  const row = screens.some((screen) => screen.id === own.id) ? screens : [...screens, own];
  const left = Math.min(...row.map((screen) => screen.x));
  const right = Math.max(...row.map((screen) => screen.x + screen.width));

  return { offset: Math.round((own.x - left) / SCALE), span: Math.ceil((right - left) / SCALE) };
}
