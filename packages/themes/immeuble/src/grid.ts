import { TILE_SIZE } from '@deskorama/core';

/** One native pixel is this many screen pixels: the canvas is drawn small and scaled up with hard edges. */
export const SCALE = 4;

/** One tile of the host's visibility grid, in screen pixels. */
export const TILE: number = TILE_SIZE;

/** One window bay in native pixels: exactly one tile of the host's visibility grid. */
export const BAY: number = TILE / SCALE;

/** The building is always this many bays wide; a wider screen shows a neighbour's facade on the right. */
export const BUILDING_BAYS = 24;

/** The building block's height in tile rows, from the sky over the roof down to the cellar. */
export const BLOCK_ROWS = 15;
