/** One display, as the platform reports it. */
export interface Screen {
  /** Stable while the display stays connected. */
  readonly id: string;
  /** Left edge in the desktop arrangement, in the coordinates of window frames. */
  readonly x: number;
  /** Top edge in the desktop arrangement, in the coordinates of window frames. */
  readonly y: number;
  /** Width in CSS pixels. */
  readonly width: number;
  /** Height in CSS pixels. */
  readonly height: number;
}
