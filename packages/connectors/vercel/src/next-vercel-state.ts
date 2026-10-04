import type { DeploymentList } from './deployment-list.ts';
import type { Observation } from './observation.ts';
import type { TrackedDeployment } from './tracked-deployment.ts';
import type { VercelState } from './vercel-state.ts';

/**
 * Returns where the next poll resumes: on the next, older page while Vercel says there is one, with `since` kept and
 * the pages read so far in the backlog; after the last page, from the newest creation time seen, with no backlog.
 * @example
 * nextVercelState(state, { deployments: [newest], pagination: { next: null } }, [], []);
 * // { since: newest.created, until: null, newest: newest.created, backlog: [], pending: [] }
 */
export function nextVercelState(
  state: VercelState,
  list: DeploymentList,
  backlog: readonly Observation[],
  pending: readonly TrackedDeployment[],
): VercelState {
  const newest = Math.max(state.newest, ...list.deployments.map((deployment) => deployment.created));

  const next = list.deployments.length > 0 ? list.pagination.next : null;

  if (next !== null) return { since: state.since, until: next, newest, backlog, pending };

  return { since: newest, until: null, newest, backlog: [], pending };
}
