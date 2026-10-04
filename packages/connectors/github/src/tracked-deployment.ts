/** A deployment seen unfinished, kept in the cursor with what its Events say, until it finishes. */
export interface TrackedDeployment {
  readonly id: number;
  readonly environment: string;
  readonly ref: string;
}
