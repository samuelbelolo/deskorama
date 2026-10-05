/** One field of a connection sheet's form, whatever it is drawn as: what it holds, and how it is marked. */
export interface FieldControl {
  readonly node: HTMLElement;
  /** What the field holds now, as the draft keeps it. */
  readonly value: () => string;
  /** Marks the field as needing a fix, or clears the mark. */
  readonly mark: (invalid: boolean) => void;
}
