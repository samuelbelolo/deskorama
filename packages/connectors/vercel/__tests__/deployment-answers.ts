import type { RecordedResponse } from '@deskorama/test-utils';

/** A deployment of the list, as Vercel words it, with the fields a test changes. */
interface ListedFields {
  readonly uid: string;
  readonly created: number;
  readonly readyState: string;
  readonly target?: 'production' | null;
  readonly ready?: number;
}

/**
 * Returns Vercel's answer to a list request: these deployments, newest first, and `next` for an older page.
 * @example
 * listAnswer([{ uid: 'dpl_1', created: 1791122100000, readyState: 'BUILDING', target: 'production' }]);
 */
export function listAnswer(deployments: readonly ListedFields[], next: number | null = null): RecordedResponse {
  const listed = deployments.map((deployment) => ({
    name: 'tramlo-web',
    target: null,
    meta: { githubCommitRef: 'main' },
    ...deployment,
  }));

  return { status: 200, body: { deployments: listed, pagination: { count: listed.length, next, prev: null } } };
}

/**
 * Returns Vercel's answer to a read by id: where the deployment stands now.
 * @example
 * statusAnswer('dpl_1', 'READY', 1791122280000); // { status: 200, body: { id: 'dpl_1', readyState: 'READY', … } }
 */
export function statusAnswer(id: string, readyState: string, ready?: number): RecordedResponse {
  return { status: 200, body: { id, name: 'tramlo-web', readyState, ...(ready === undefined ? {} : { ready }) } };
}
