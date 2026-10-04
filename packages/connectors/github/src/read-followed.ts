import { parsePayload, type StandardSchema } from '@deskorama/core';
import type { GithubSession, ReadOptions } from './create-github-session.ts';

/**
 * Returns one resource followed by id, such as a run still going, validated by `schema`: `unchanged` when it did
 * not change since it was last read, or null when it was deleted since.
 * @example
 * await readFollowed(session, '/actions/runs/5103', ACTIONS_PERMISSION, RUN_SCHEMA, 'The workflow run');
 * // { id: 5103, status: 'completed', conclusion: 'failure', … }
 */
export async function readFollowed<Output>(
  session: GithubSession,
  path: string,
  permission: string,
  schema: StandardSchema<Output>,
  what: string,
  options: ReadOptions = {},
): Promise<Output | 'unchanged' | null> {
  const answer = await session.get(path, permission, options);

  if (answer.kind === 'unchanged') return 'unchanged';

  if (answer.kind !== 'changed') return null;

  return parsePayload(schema, answer.body, what);
}
