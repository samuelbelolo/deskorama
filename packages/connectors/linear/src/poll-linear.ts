import { sendRequest, type PollInput, type PollResult } from '@deskorama/core';
import { issueEvents } from './issue-events.ts';
import { ISSUES_QUERY } from './issues-query.ts';
import { nextLinearState } from './next-linear-state.ts';
import { readLinearIssues } from './read-linear-issues.ts';
import { readLinearState } from './read-linear-state.ts';

/** Where Linear's GraphQL API answers. */
const LINEAR_API = 'https://api.linear.app/graphql';

/**
 * Polls a Linear workspace once: the issues updated since the newest update the last catch-up saw, one page at a
 * time, as issues created and completed, oldest first. The key goes as Linear expects a personal key, without
 * `Bearer`.
 * @example
 * await pollLinear({ settings: { name: 'Tramlo', values: {}, token }, cursor: null, fetch, now });
 * // { events: [{ kind: 'issue.created', … }], cursor: '{"since":"2026-10-04T13:57:12.004Z",…}' }
 */
export async function pollLinear(input: PollInput): Promise<PollResult> {
  const state = readLinearState(input.cursor, input.now);

  const body = JSON.stringify({
    query: ISSUES_QUERY,
    variables: { filter: { updatedAt: { gt: state.since } }, after: state.after },
  });

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: input.settings.token,
  };

  const response = await sendRequest(input.fetch, LINEAR_API, { method: 'POST', headers, body });

  const page = await readLinearIssues(response, input.now);

  const events = page.nodes
    .flatMap((issue) => issueEvents(issue, state.from, input.settings.name))
    .toSorted((a, b) => a.at.getTime() - b.at.getTime());

  const next = nextLinearState(state, page);

  return { events, cursor: JSON.stringify(next), ...(next.after === null ? {} : { delay: 0 }) };
}
