import type { Point, Rect } from './rect.ts';

/** What a Theme asks for when it looks for room to play a Gag. All rectangles are in screen pixels. */
export interface SpotRequest {
  readonly w: number;
  readonly h: number;
  /** The spot closest to this point; without it, any spot, drawn with the seeded random generator. */
  readonly near?: Point;
  /** Only inside this region, e.g. the ground band. */
  readonly within?: Rect;
  /** Holds the spot for this many Clock milliseconds, so simultaneous Gags never overlap. */
  readonly hold?: number;
  /** Never on these rectangles, e.g. the Theme's own character. */
  readonly avoid?: readonly Rect[];
}

/** A fully visible spot of the requested size. */
export interface FreeSpot extends Rect {
  /** Gives a held spot back early, when the Gag ends or gives up; does nothing for a spot not held. */
  release(): void;
}

/** How to look for the largest free rectangle. */
export interface LargestFreeOptions {
  /** Counts tiles held by a Gag or reserved by a sign as taken. */
  readonly skipHeld?: boolean;
}
