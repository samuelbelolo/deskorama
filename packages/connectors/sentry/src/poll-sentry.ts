import { pickedValues, type PollInput, type PollResult } from '@deskorama/core';
import { getSentry } from './get-sentry.ts';
import { issueEvents } from './issue-events.ts';
import { issuesUrl } from './issues-url.ts';
import { nextSentryState } from './next-sentry-state.ts';
import { readSentryState } from './read-sentry-state.ts';
import { SENTRY_ENVIRONMENTS_FIELD, SENTRY_PERMISSION, SENTRY_PROJECTS_FIELD } from './sentry-config.ts';
import { SENTRY_ISSUES_SCHEMA } from './sentry-issues-schema.ts';
import { sentryOrganization } from './sentry-organization.ts';
import { writeSentryState } from './write-sentry-state.ts';

/** How far before the cursor each poll looks again: an error Sentry indexes late still plays, and only once. */
const OVERLAP_MS = 10 * 60_000;

/**
 * Polls a Sentry organization once: one page of its unresolved issues seen since the latest error the last catch-up
 * saw, minus an overlap, as new or recurring errors, oldest first and never one already told, in the projects and
 * the environments the Source picked, or in all of them when it picked none. The cursor moves to the latest time
 * Sentry saw an error once every page is read, so the window follows Sentry's clock.
 * @example
 * await pollSentry({ settings: { name: 'Tramlo', values: { organization: 'tramlo' },
 *   lists: { projects: ['tramlo-web'], environments: ['production'] }, token }, cursor: null, fetch, now });
 * // { events: [{ kind: 'issue.new', … }], cursor: '{"since":1791122260000,…}' }
 */
export async function pollSentry(input: PollInput): Promise<PollResult> {
  const organization = sentryOrganization(input.settings);

  const state = readSentryState(input.cursor, input.now);

  const from = state.since - OVERLAP_MS;

  const filters = {
    projects: pickedValues(input.settings, SENTRY_PROJECTS_FIELD),
    environments: pickedValues(input.settings, SENTRY_ENVIRONMENTS_FIELD),
  };

  const url = issuesUrl(organization, filters, { from, now: input.now, page: state.page });

  const read = { schema: SENTRY_ISSUES_SCHEMA, what: 'The issues', permission: SENTRY_PERMISSION };

  const { payload: issues, next: page } = await getSentry(input, url, read);

  const found = issues.flatMap((issue) => issueEvents(issue, from, input.settings.name));

  const events = found.filter((event) => !(event.id in state.told)).toSorted((a, b) => a.at.getTime() - b.at.getTime());

  const told = { ...state.told, ...Object.fromEntries(found.map((event) => [event.id, event.at.getTime()])) };

  const latest = Math.max(0, ...issues.map((issue) => Date.parse(issue.lastSeen)));

  const next = nextSentryState(state, page, latest, told, OVERLAP_MS);

  return { events, cursor: writeSentryState(next), ...(page === null ? {} : { delay: 0 }) };
}
