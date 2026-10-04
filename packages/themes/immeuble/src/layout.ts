import type { Screen } from '@deskorama/core';
import { BAY, BLOCK_ROWS, BUILDING_BAYS, SCALE, TILE } from './grid.ts';
import { sideOf, type Side } from './side-of.ts';

/**
 * The building's geometry on one screen, in native pixels unless named otherwise. The block of 15 tile rows (sky,
 * mansard, three floors, ground floor, street, cellar) stands on whole tiles from the top: a taller screen gets
 * more sky above it and a deeper cellar under it, so every bay stays on the visibility grid; a screen shorter than
 * 900 px crops the cellar and the street, never the roof and its crane.
 */
export interface Layout {
  /** The building itself, or the next building along the street. */
  readonly side: Side;
  /** The screen's size in screen pixels. */
  readonly width: number;
  readonly height: number;
  /** The canvas's size in native pixels. */
  readonly W: number;
  readonly H: number;
  /** The y of the block's first tile row. */
  readonly top: number;
  /** The first tile row of the block, on the host's grid. */
  readonly topRow: number;
  readonly roofY: number;
  /** The top of the ground floor: the agency, the hall, the loge and the shops. */
  readonly rdcY: number;
  readonly streetY: number;
  /** The kerb line people and props stand on. */
  readonly sidewalkY: number;
  readonly cellarY: number;
  readonly buildingW: number;
}

/**
 * Returns the building's geometry for a screen.
 * @example
 * layoutFor({ id: 'builtin', x: 0, y: 0, width: 1440, height: 900 }).rdcY; // 165
 * layoutFor({ id: 'builtin', x: 0, y: 0, width: 1512, height: 982 }).top; // 15: one more tile row of sky
 * layoutFor({ id: 'external', x: 1440, y: 0, width: 1600, height: 900 }).side; // "next"
 */
export function layoutFor(screen: Screen): Layout {
  const topRow = Math.max(0, Math.floor(screen.height / TILE) - BLOCK_ROWS);
  const top = topRow * BAY;
  const streetY = top + 13 * BAY;

  return {
    side: sideOf(screen),
    width: screen.width,
    height: screen.height,
    W: Math.ceil(screen.width / SCALE),
    H: Math.ceil(screen.height / SCALE),
    top,
    topRow,
    roofY: top + 4 * BAY,
    rdcY: top + 11 * BAY,
    streetY,
    sidewalkY: streetY + 5,
    cellarY: top + 14 * BAY,
    buildingW: BUILDING_BAYS * BAY,
  };
}
