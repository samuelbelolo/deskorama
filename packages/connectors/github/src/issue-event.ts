import type { SourceEvent } from '@deskorama/core';
import { clip } from './clip.ts';
import { eventText } from './event-text.ts';
import { githubEvent } from './github-event.ts';
import type { Issue } from './issue-schema.ts';
import { DETAIL_LENGTH } from './limits.ts';
import type { Scan } from './scan.ts';

/**
 * Returns the Event of an issue opened since `scan.since`, quoted the way each language quotes.
 * @example
 * issueEvent({ number: 421, title: 'The Export button does nothing', is_pull: false, … }, scan);
 * // { kind: 'issue.opened', archetype: 'message', text: { fr: { detail: '« The Export button does nothing »' } } }
 */
export function issueEvent(issue: Issue, scan: Scan): SourceEvent | null {
  if (issue.created_at <= scan.since) return null;

  const title = clip(issue.title, DETAIL_LENGTH - 4);

  return githubEvent(scan.source, {
    id: `issue-${issue.number}-opened`,
    kind: 'issue.opened',
    archetype: 'message',
    rarity: 'notable',
    at: issue.created_at,
    text: eventText(
      { fr: 'Issue ouverte', en: 'Issue opened' },
      { fr: `« ${title} »`, en: `“${title}”` },
      `#${issue.number}`,
    ),
  });
}
