import type { ReadyState } from './ready-state.ts';
import type { TrackedDeployment } from './tracked-deployment.ts';

/** A deployment as one poll saw it: listed as new, or read again by its id because it was unfinished. */
export interface Observation {
  readonly tracked: TrackedDeployment;
  readonly readyState: ReadyState;
  /** When it finished, in milliseconds since the epoch, when Vercel says. */
  readonly ready?: number | undefined;
  /** True when an earlier poll already saw it unfinished, so its start is not told twice. */
  readonly wasPending: boolean;
}
