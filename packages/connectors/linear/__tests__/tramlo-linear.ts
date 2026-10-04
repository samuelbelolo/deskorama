import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SourceSettings } from '@deskorama/core';
import type { RecordedResponse } from '@deskorama/test-utils';

/** The Linear workspace of Tramlo, a fictional product, as a person connects it: a read-only key, no field. */
export const TRAMLO_LINEAR: SourceSettings = {
  name: 'Tramlo',
  values: {},
  token: 'tramlo-linear-key-for-tests',
};

/** An issue as Linear's answer words it, with the fields a test changes. */
interface IssueFields {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedAt?: string | null;
  readonly state?: string;
  readonly identifier?: string;
  readonly title?: string;
}

/**
 * Returns a recorded `200` answer of Linear whose body is one of the recordings next to this file.
 * @example
 * recorded('issues-last-hour.json'); // { status: 200, headers: { … }, body: { data: { issues: { … } } } }
 */
export function recorded(name: string): RecordedResponse {
  const body = JSON.parse(readFileSync(join(import.meta.dirname, 'recordings', name), 'utf8')) as unknown;

  return { status: 200, headers: { 'Content-Type': 'application/json' }, body };
}

/**
 * Returns Linear's answer of one page of issues, with `endCursor` set when another page follows.
 * @example
 * issuesAnswer([{ id: 'a1', createdAt: '2026-10-04T14:00:30Z', updatedAt: '2026-10-04T14:00:30Z' }]);
 */
export function issuesAnswer(issues: readonly IssueFields[], endCursor: string | null = null): RecordedResponse {
  const nodes = issues.map(({ id, createdAt, updatedAt, completedAt = null, state = 'unstarted', ...words }) => ({
    id,
    identifier: words.identifier ?? `ENG-${id}`,
    title: words.title ?? 'Search by invoice number',
    createdAt,
    updatedAt,
    completedAt,
    state: { type: state },
  }));

  return {
    status: 200,
    body: { data: { issues: { nodes, pageInfo: { hasNextPage: endCursor !== null, endCursor } } } },
  };
}

/**
 * Returns Linear's answer to a failed query: `400` and one GraphQL error of the given type.
 * @example
 * errorAnswer('authentication error'); // { status: 400, body: { errors: [{ extensions: { type: … } }] } }
 */
export function errorAnswer(type: string, headers: Readonly<Record<string, string>> = {}): RecordedResponse {
  return {
    status: 400,
    headers,
    body: { errors: [{ message: 'Refused', extensions: { type, code: type.toUpperCase().replace(' ', '_') } }] },
  };
}
