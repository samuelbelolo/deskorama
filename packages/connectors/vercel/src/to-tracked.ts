import type { ListedDeployment } from './deployment-list.ts';
import type { TrackedDeployment } from './tracked-deployment.ts';

/** Where each Git provider tells Vercel the branch a deployment was built from. */
const BRANCH_KEYS = ['githubCommitRef', 'gitlabCommitRef', 'bitbucketCommitRef'];

/**
 * Returns what the Connector keeps of a listed deployment: its id, project name, branch, target and creation time.
 * @example
 * toTracked({ uid: 'dpl_7Hq2', name: 'tramlo-web', created: 1791119400000, readyState: 'READY',
 *   target: 'production', meta: { githubCommitRef: 'main' } });
 * // { id: 'dpl_7Hq2', name: 'tramlo-web', branch: 'main', production: true, created: 1791119400000 }
 */
export function toTracked(deployment: ListedDeployment): TrackedDeployment {
  return {
    id: deployment.uid,
    name: deployment.name,
    branch: branchOf(deployment.meta ?? {}),
    production: deployment.target === 'production',
    created: deployment.created,
  };
}

/**
 * Returns the branch a deployment's Git metadata names, or null when it was deployed without Git.
 * @example
 * branchOf({ gitlabCommitRef: 'release/2.5' }); // 'release/2.5'
 * branchOf({}); // null
 */
function branchOf(meta: Readonly<Record<string, unknown>>): string | null {
  for (const key of BRANCH_KEYS) {
    const branch = meta[key];

    if (typeof branch === 'string' && branch !== '') return branch;
  }

  return null;
}
