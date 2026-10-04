import { ConnectorError } from '@deskorama/core';

/** An owner and a repository name, as GitHub allows them. */
const NAME = /^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)$/;

/**
 * Returns the `owner/name` of the repository a person typed, also from its GitHub address; anything else is an
 * `invalid-response` {@link ConnectorError}, like a Feed address that is not HTTPS.
 * @example
 * repositoryName('tramlo/tramlo-app'); // 'tramlo/tramlo-app'
 * repositoryName('https://github.com/tramlo/tramlo-app.git'); // 'tramlo/tramlo-app'
 */
export function repositoryName(typed: string): string {
  const bare = typed
    .trim()
    .replace(/^https:\/\/github\.com\//, '')
    .replace(/(\.git)?\/?$/, '');

  if (!NAME.test(bare)) {
    throw new ConnectorError({ kind: 'invalid-response' }, 'A GitHub repository is written owner/name.');
  }

  return bare;
}
