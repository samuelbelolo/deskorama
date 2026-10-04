/** A display as the frame watch reads it: its whole area and the part left once the menu bar and Dock are drawn. */
export interface DisplayArea {
  readonly id: number;
  readonly bounds: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
  readonly workArea: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
}
