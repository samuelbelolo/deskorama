/** Where each Source's cursor is kept between launches, so a poll resumes where the last one stopped. */
export interface CursorStore {
  read(sourceId: string): string | null;
  /** Saves the cursor of a Source; null forgets it. */
  write(sourceId: string, cursor: string | null): void;
}
