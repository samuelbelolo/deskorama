/**
 * A deployment as the Connector remembers it between polls while it is unfinished, and words it in an Event: the
 * project's name, the branch, and whether it ships to production.
 */
export interface TrackedDeployment {
  readonly id: string;
  readonly name: string;
  /** The Git branch it was built from, when Vercel knows it. */
  readonly branch: string | null;
  readonly production: boolean;
  /** When it was created, in milliseconds since the epoch. */
  readonly created: number;
}
