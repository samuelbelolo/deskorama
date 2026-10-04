import type { SourceEvent } from '@deskorama/core';
import { hourOf } from './hour-of.ts';
import type { SentryIssue } from './sentry-issue.ts';
import { toSentryEvent } from './to-sentry-event.ts';

/**
 * Returns what an issue seen since `from` tells, each on its own: a new error when its first event is since then,
 * and a recurring one when its latest event is since then in a later hour than its first, so an error firing every
 * minute plays at most once an hour and never in the hour it was new.
 * @example
 * issueEvents({ id: '4821', firstSeen: '2026-10-04T13:48:12Z', lastSeen: '2026-10-04T15:03:00Z', … },
 *   Date.parse('2026-10-04T13:00:00Z'), 'Tramlo');
 * // [{ id: '4821-new', … }, { id: '4821-recurring-2026-10-04T15', … }]
 */
export function issueEvents(issue: SentryIssue, from: number, source: string): SourceEvent[] {
  const firstSeen = Date.parse(issue.firstSeen);

  const lastSeen = Date.parse(issue.lastSeen);

  const events: SourceEvent[] = [];

  if (firstSeen >= from) events.push(toSentryEvent('issue.new', issue, source));

  if (lastSeen >= from && hourOf(lastSeen) !== hourOf(firstSeen)) {
    events.push(toSentryEvent('issue.recurring', issue, source));
  }

  return events;
}
