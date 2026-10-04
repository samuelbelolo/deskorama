/** One suitcase on the recap's belt: what its tag says, how many missed Events it stands for, and its tone. */
export interface RecapCase {
  readonly label: string;
  readonly count: number;
  /** Bad news shows its tag in orange; anything else in ink. */
  readonly news: boolean;
}
