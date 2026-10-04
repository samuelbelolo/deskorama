import { ConnectorError, parsePayload, type StandardSchema } from '@deskorama/core';
import type { GithubSession } from './create-github-session.ts';

/**
 * Returns a resource read through `session` and validated by `schema`, or null when it did not change since the
 * previous poll. A `404` means the repository is out of the token's reach, named after `permission`.
 * @example
 * await readChanged(session, '', METADATA_PERMISSION, REPOSITORY_SCHEMA, 'The repository');
 * // { default_branch: 'main', … }, or null after a 304
 */
export async function readChanged<Output>(
  session: GithubSession,
  path: string,
  permission: string,
  schema: StandardSchema<Output>,
  what: string,
): Promise<Output | null> {
  const answer = await session.get(path, permission);

  if (answer.kind === 'unchanged') return null;

  if (answer.kind === 'missing') {
    throw new ConnectorError({ kind: 'permission', permission }, `GitHub answered 404 for ${what}.`);
  }

  if (answer.kind === 'empty')
    throw new ConnectorError({ kind: 'invalid-response' }, `GitHub answered 409 for ${what}.`);

  return parsePayload(schema, answer.body, what);
}
