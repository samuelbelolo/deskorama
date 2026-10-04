import type { SourceEvent } from '@deskorama/core';
import type { LinearIssue } from './linear-issues.ts';
import { toLinearEvent } from './to-linear-event.ts';

/**
 * Returns what an issue updated after `since` tells, oldest first: `updatedAt` moves on any edit, so the meaning
 * comes from the other fields. It was created if `createdAt` is after `since`, and completed if it is in a completed
 * state with `completedAt` after `since`; any other edit tells nothing. A completion is keyed by its time, so an
 * issue reopened and completed again plays again.
 * @example
 * issueEvents({ id: 'f3a9', createdAt: '2026-09-30T08:00:00Z', completedAt: '2026-10-04T13:53:00Z',
 *   state: { type: 'completed' }, … }, '2026-10-04T13:00:00.000Z', 'Tramlo');
 * // [{ id: 'f3a9-completed-2026-10-04T13:53:00Z', kind: 'issue.completed', … }]
 */
export function issueEvents(issue: LinearIssue, since: string, source: string): SourceEvent[] {
  const after = Date.parse(since);

  const created = Date.parse(issue.createdAt);

  const events: SourceEvent[] = [];

  if (created > after) events.push(toLinearEvent('issue.created', issue, `${issue.id}-created`, created, source));

  if (issue.state.type === 'completed' && issue.completedAt !== null) {
    const completed = Date.parse(issue.completedAt);

    const id = `${issue.id}-completed-${issue.completedAt}`;

    if (completed > after) events.push(toLinearEvent('issue.completed', issue, id, completed, source));
  }

  return events;
}
