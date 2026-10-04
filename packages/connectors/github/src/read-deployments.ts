import type { SourceEvent } from '@deskorama/core';
import type { GithubSession } from './create-github-session.ts';
import { deployEvent } from './deploy-event.ts';
import { deploymentProgress, type DeploymentProgress } from './deployment-progress.ts';
import { DEPLOYMENTS_SCHEMA } from './deployment-schema.ts';
import { DEPLOYMENT_STATUSES_SCHEMA } from './deployment-status-schema.ts';
import { DEPLOYMENTS_PERMISSION } from './github-permissions.ts';
import { inSequence } from './in-sequence.ts';
import { readFollowed } from './read-followed.ts';
import { readRecentPages } from './read-recent-pages.ts';
import type { Scan } from './scan.ts';
import type { TrackedDeployment } from './tracked-deployment.ts';

/** The deployments created last. */
const PATH = '/deployments?per_page=10';

/** At most this many unfinished deployments are followed, the newest ones. */
const MAX_TRACKED = 10;

/** What the deployments brought, and those still going. */
export interface DeploymentsFound {
  readonly events: readonly SourceEvent[];
  readonly unfinished: readonly TrackedDeployment[];
}

/**
 * Reads the production deployments created since `scan.since` and the statuses of every unfinished one, by id: a
 * new deployment starts, and one that ends succeeds or fails, so the build Gauge follows it to the end. A preview
 * or a staging deployment is no deploy of the product, so it plays nothing.
 * @example
 * await readDeployments(session, [], scan);
 * // { events: [{ kind: 'deployment.started', … }, { kind: 'deployment.succeeded', … }], unfinished: [] }
 */
export async function readDeployments(
  session: GithubSession,
  tracked: readonly TrackedDeployment[],
  scan: Scan,
): Promise<DeploymentsFound> {
  const listed =
    (await readRecentPages(session, {
      path: PATH,
      permission: DEPLOYMENTS_PERMISSION,
      schema: DEPLOYMENTS_SCHEMA,
      what: 'The deployments',
      isNew: (deployment) => deployment.created_at > scan.since,
    })) ?? [];

  const trackedIds = new Set(tracked.map((deployment) => deployment.id));

  const created = listed.filter(
    (deployment) => deployment.production && deployment.created_at > scan.since && !trackedIds.has(deployment.id),
  );

  const events: SourceEvent[] = created.map((deployment) =>
    deployEvent(deployment, 'started', deployment.created_at, scan),
  );

  // A deployment seen for the first time may have finished before a previous poll: its statuses are read in full,
  // since a 304 would only say they did not change, not that it is still going.
  const followed = await inSequence(
    [
      ...created.map((deployment) => ({ deployment, known: false })),
      ...tracked.map((deployment) => ({ deployment, known: true })),
    ],
    async ({ deployment, known }) => ({ deployment, progress: await readProgress(session, deployment.id, known) }),
  );

  const unfinished: TrackedDeployment[] = [];

  for (const { deployment, progress } of followed) {
    switch (progress.kind) {
      case 'going':
        unfinished.push({ id: deployment.id, environment: deployment.environment, ref: deployment.ref });
        break;
      case 'done':
        events.push(deployEvent(deployment, progress.step, progress.at, scan));
        break;
      case 'retired':
        break;
    }
  }

  return { events, unfinished: unfinished.toSorted((a, b) => b.id - a.id).slice(0, MAX_TRACKED) };
}

/**
 * Returns where a deployment stands from its statuses. Asked with the ETag of its last read only when it was
 * `known` to be going, so an unchanged answer means it still is; a deleted deployment is retired.
 * @example
 * await readProgress(session, 61, false); // { kind: 'done', step: 'succeeded', at }
 */
async function readProgress(session: GithubSession, id: number, known: boolean): Promise<DeploymentProgress> {
  const statuses = await readFollowed(
    session,
    `/deployments/${id}/statuses?per_page=10`,
    DEPLOYMENTS_PERMISSION,
    DEPLOYMENT_STATUSES_SCHEMA,
    'The deployment statuses',
    { conditional: known },
  );

  if (statuses === null) return { kind: 'retired' };

  if (statuses === 'unchanged') return { kind: 'going' };

  return deploymentProgress(statuses);
}
