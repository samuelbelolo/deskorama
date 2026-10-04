import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RecordedResponse } from '@deskorama/test-utils';

/** Where the recorded GitHub answers live, one folder per fictional repository. */
const RECORDINGS = join(import.meta.dirname, 'recordings');

/**
 * Returns a recorded `200` answer of GitHub whose body is one recording, with an ETag naming it and a rate limit
 * far from spent, plus any `headers` given.
 * @example
 * recording('tramlo-app', 'pulls.json'); // { status: 200, headers: { ETag: '"tramlo-app/pulls.json"', … }, body: [ … ] }
 */
export function recording(
  repository: string,
  file: string,
  headers: Readonly<Record<string, string>> = {},
): RecordedResponse {
  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ETag: `"${repository}/${file}"`,
      'X-RateLimit-Limit': '5000',
      'X-RateLimit-Remaining': '4990',
      'X-RateLimit-Reset': '1791126000',
      ...headers,
    },
    body: JSON.parse(readFileSync(join(RECORDINGS, repository, file), 'utf8')) as unknown,
  };
}
