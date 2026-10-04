import type { Rect } from '@deskorama/core';

/** A flat or a mansard room tenants can live in, aligned on the visibility grid. */
export interface Room {
  readonly id: string;
  /** The first tile column and row, on the host's grid. */
  readonly col: number;
  readonly row: number;
  /** Its height in tile rows: 2 for a flat, 1 for a mansard room. */
  readonly rows: number;
  /** Its width in bays. */
  readonly bays: number;
  /** Its native rectangle. */
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  /** The native line its furniture and its tenant stand on. */
  readonly floorY: number;
  /** Picks its furniture, so each flat is furnished its own way. */
  readonly seed: number;
  /** Its rectangle in screen pixels. */
  readonly stage: Rect;
}
