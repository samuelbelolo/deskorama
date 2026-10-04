import { ConnectorError, parsePayload, readJson, sendRequest, type PollInput, type PollResult } from '@deskorama/core';
import { issueEvents } from './issue-events.ts';
import { issuesUrl } from './issues-url.ts';
import { nextPage } from './next-page.ts';
import { nextSentryState } from './next-sentry-state.ts';
import { readSentryState } from './read-sentry-state.ts';
import { SENTRY_ORGANIZATION_FIELD } from './sentry-config.ts';
import { sentryFailure } from './sentry-failure.ts';
import { SENTRY_ISSUES_SCHEMA } from './sentry-issues-schema.ts';
import { writeSentryState } from './write-sentry-state.ts';

/** How far before the cursor each poll looks again: an error Sentry indexes late still plays, and only once. */
const OVERLAP_MS = 10 * 60_000;

/**
 * Polls a Sentry organization once: one page of its unresolved issues seen since the latest error the last catch-up
 * saw, minus an overlap, as new or recurring errors, oldest first and never one already told. The cursor moves to
 * the latest time Sentry saw an error once every page is read, so the window follows Sentry's clock.
 * @example
 * await pollSentry({ settings: { name: 'Tramlo', values: { organization: 'tramlo' }, token }, cursor: null, fetch, now });
 * // { events: [{ kind: 'issue.new', … }], cursor: '{"since":1791122260000,…}' }
 */
export async function pollSentry(input: PollInput): Promise<PollResult> {
  const organization = input.settings.values[SENTRY_ORGANIZATION_FIELD] ?? '';

  if (organization === '') {
    throw new ConnectorError({ kind: 'invalid-response' }, 'A Sentry Source names its organization.');
  }

  const state = readSentryState(input.cursor, input.now);

  const from = state.since - OVERLAP_MS;

  const headers = { Accept: 'application/json', Authorization: `Bearer ${input.settings.token}` };

  const url = issuesUrl(organization, from, input.now, state.page);

  const response = await sendRequest(input.fetch, url, { method: 'GET', headers });

  const failure = sentryFailure(response, input.now);

  if (failure !== null) throw failure;

  const issues = await parsePayload(SENTRY_ISSUES_SCHEMA, await readJson(response, 'The issues'), 'The issues');

  const found = issues.flatMap((issue) => issueEvents(issue, from, input.settings.name));

  const events = found.filter((event) => !(event.id in state.told)).toSorted((a, b) => a.at.getTime() - b.at.getTime());

  const told = { ...state.told, ...Object.fromEntries(found.map((event) => [event.id, event.at.getTime()])) };

  const latest = Math.max(0, ...issues.map((issue) => Date.parse(issue.lastSeen)));

  const page = nextPage(response.headers.get('link'));

  const next = nextSentryState(state, page, latest, told, OVERLAP_MS);

  return { events, cursor: writeSentryState(next), ...(page === null ? {} : { delay: 0 }) };
}
