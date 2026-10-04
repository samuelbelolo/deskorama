import type { Observation } from './observation.ts';
import type { TrackedDeployment } from './tracked-deployment.ts';

/**
 * What the Vercel Connector resumes from, kept inside the opaque cursor the platform persists. Vercel lists
 * deployments by creation time, so a deploy that goes from building to ready is not new: the unfinished ones are kept
 * here and read again by id until they finish.
 */
export interface VercelState {
  /** List the deployments created after this time, in milliseconds since the epoch. */
  readonly since: number;
  /** While catching up on more than a page, list those created before this time; null otherwise. */
  readonly until: number | null;
  /** The newest creation time seen while catching up: `since` moves there once the last page is read. */
  readonly newest: number;
  /**
   * What the pages of a catch-up showed so far: Vercel pages newest first, so they are told together, oldest first,
   * once the last page is read, and an old failure never plays after a newer success.
   */
  readonly backlog: readonly Observation[];
  /** The unfinished deployments, in the order they are read again: the longest unread first. */
  readonly pending: readonly TrackedDeployment[];
}
