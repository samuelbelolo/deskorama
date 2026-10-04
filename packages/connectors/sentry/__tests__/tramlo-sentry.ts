import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SourceSettings } from '@deskorama/core';
import type { RecordedResponse } from '@deskorama/test-utils';

/** The Sentry organization of Tramlo, a fictional product, as a person connects it. */
export const TRAMLO_SENTRY: SourceSettings = {
  name: 'Tramlo',
  values: { organization: 'tramlo' },
  token: 'tramlo-sentry-token-for-tests',
};

/**
 * Returns a recorded `200` answer of Sentry whose body is one of the recordings next to this file.
 * @example
 * recorded('issues-last-hour.json'); // { status: 200, headers: { … }, body: [{ id: '4821', … }, …] }
 */
export function recorded(name: string): RecordedResponse {
  const body = JSON.parse(readFileSync(join(import.meta.dirname, 'recordings', name), 'utf8')) as unknown;

  return { status: 200, headers: { 'Content-Type': 'application/json' }, body };
}

/** An issue as Sentry's answer words it, with the fields a test changes. */
interface IssueFields {
  readonly firstSeen: string;
  readonly lastSeen: string;
  readonly count?: string;
  /** The first time over the issue's whole life, when it differs from the period searched. */
  readonly lifetimeFirstSeen?: string;
}

/**
 * Returns one issue as Sentry lists it, with the fields the Connector reads.
 * @example
 * sentryIssue('77', { firstSeen: '2026-10-04T14:01:00Z', lastSeen: '2026-10-04T14:01:00Z' }); // { id: '77', … }
 */
export function sentryIssue(id: string, fields: IssueFields): Record<string, unknown> {
  const { firstSeen, lastSeen, count = '1', lifetimeFirstSeen } = fields;

  const lifetime = lifetimeFirstSeen === undefined ? {} : { lifetime: { firstSeen: lifetimeFirstSeen, count } };

  return { id, shortId: `TRAMLO-WEB-${id}`, firstSeen, lastSeen, count, metadata: { type: 'RangeError' }, ...lifetime };
}

/**
 * Returns Sentry's answer listing these issues, with a `Link` header pointing at a next page when `next` is given.
 * @example
 * issuesAnswer([sentryIssue('77', fields)], '0:100:0'); // { status: 200, headers: { Link: '…cursor="0:100:0"' }, … }
 */
export function issuesAnswer(issues: readonly Record<string, unknown>[], next?: string): RecordedResponse {
  const link = `<https://sentry.io/api/0/organizations/tramlo/issues/?cursor=${next ?? ''}>; rel="next"; results="true"; cursor="${next ?? ''}"`;

  return { status: 200, headers: next === undefined ? {} : { Link: link }, body: issues };
}
