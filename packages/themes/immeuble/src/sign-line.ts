/** One line of text on a sign, placed in native pixels, `y` at the top of its capitals. */
export interface SignLine {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly colour: string;
}
