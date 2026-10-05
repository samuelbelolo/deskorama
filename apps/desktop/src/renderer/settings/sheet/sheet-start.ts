/** The Source a connection sheet edits, or the empty values of a new one. */
export interface SheetStart {
  /** Null for a new Source. */
  readonly id: string | null;
  readonly name: string;
  readonly values: Readonly<Record<string, string>>;
  /** The chosen polling interval in milliseconds, or null for the Connector's default. */
  readonly interval: number | null;
}
