import type { Visibility } from './visibility.ts';

/** What every reader of one poll shares: whose Events they are and which ones are new. */
export interface Scan {
  /** The Source's display name, set on every Event. */
  readonly source: string;
  /** Things that happened after this time, in milliseconds since the epoch, are new. */
  readonly since: number;
  readonly now: number;
  readonly visibility: Visibility;
}
