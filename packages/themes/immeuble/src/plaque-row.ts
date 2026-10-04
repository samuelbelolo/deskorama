/** One row of a plaque: its text, colour and scale, and the detail drawn after the fact on the same row. */
export interface PlaqueRow {
  readonly text: string;
  readonly colour: string;
  readonly scale: number;
  readonly tail?: string;
}
