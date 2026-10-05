import { ConnectorError, type PollInput } from '@deskorama/core';
import type { DeploymentList } from './deployment-list.ts';
import { DEPLOYMENT_LIST_SCHEMA } from './deployment-list-schema.ts';
import { getVercel } from './get-vercel.ts';
import type { VercelState } from './vercel-state.ts';

/** How many deployments a page holds: a burst beyond it is read page after page. */
const PAGE_SIZE = 20;

/**
 * Returns one page of the projects' deployments created after the state's `since`, and before its `until` while
 * catching up, newest first, in one request whatever the number of projects: Vercel filters on one project by name
 * or ID, and on several by ID only. Throws the {@link ConnectorError} a failed answer means.
 * @example
 * await listDeployments(input, ['tramlo-web'], { since: 1791118800000, until: null, newest: 1791118800000, … });
 * // GET https://api.vercel.com/v7/deployments?projectId=tramlo-web&since=1791118800000&limit=20
 * await listDeployments(input, ['prj_web', 'prj_api'], state);
 * // GET https://api.vercel.com/v7/deployments?projectIds=prj_web&projectIds=prj_api&since=…&limit=20
 */
export async function listDeployments(
  input: PollInput,
  projects: readonly string[],
  state: VercelState,
): Promise<DeploymentList> {
  const [only] = projects;

  const filter = projects.length === 1 && only !== undefined ? { projectId: only } : { projectIds: projects };

  const query = {
    ...filter,
    since: String(state.since),
    ...(state.until === null ? {} : { until: String(state.until) }),
    limit: String(PAGE_SIZE),
  };

  const list = await getVercel(input, '/v7/deployments', query, DEPLOYMENT_LIST_SCHEMA, 'The deployment list');

  if (list === null) {
    throw new ConnectorError({ kind: 'invalid-response' }, `Vercel does not know ${projects.join(', ')}.`);
  }

  return list;
}
