/** A rectangle in CSS pixels: a window frame, a free spot, a sign. */
export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** A point in CSS pixels. */
export interface Point {
  readonly x: number;
  readonly y: number;
}
