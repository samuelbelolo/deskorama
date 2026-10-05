/** One project of the list, once validated: its ID and its name, the rest is dropped. */
export interface ListedProject {
  readonly id: string;
  readonly name: string;
}

/** One page of the projects a token can see. */
export interface ProjectList {
  readonly projects: readonly ListedProject[];
  /** What to list from for the next page; null on the last one. */
  readonly next: string | null;
}
