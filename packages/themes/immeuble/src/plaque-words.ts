/** What a plaque says, in capitals: the Gag's sound, the plain fact, the concrete detail. */
export interface PlaqueWords {
  /** Dropped first when room runs out; null for a silent Gag. */
  readonly sound: string | null;
  /** The Event's label, never reworded, never dropped. */
  readonly fact: string;
  /** The Event's detail; dropped before the fact; empty when it has none. */
  readonly detail: string;
}
