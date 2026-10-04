import type { SourceEvent } from '@deskorama/core';
import { hourOf } from './hour-of.ts';
import type { SentryIssue } from './sentry-issue.ts';

/** The kinds of Event a Sentry organization produces: an error never seen before, and one that comes back. */
export type SentryKind = 'issue.new' | 'issue.recurring';

/**
 * Returns the Event of an issue, worded in both languages: its detail names the issue and the exception's type,
 * never its message, which may quote a person's data. A new error plays at its first event, is notable and raises
 * today's count; a recurring one plays at its latest event, once an hour, and says how many times it happened.
 * @example
 * toSentryEvent('issue.new', issue, 'Tramlo').text.en;
 * // { label: 'New error', detail: 'TRAMLO-WEB-3F · TypeError', tag: 'NEW' }
 */
export function toSentryEvent(kind: SentryKind, issue: SentryIssue, source: string): SourceEvent {
  const name = issue.type === '' ? issue.shortId : `${issue.shortId} · ${issue.type}`;

  const common = { kind, archetype: 'error', recognised: true, source } as const;

  if (kind === 'issue.new') {
    return {
      ...common,
      id: `${issue.id}-new`,
      at: new Date(issue.firstSeen),
      rarity: 'notable',
      gauge: { role: 'daily', by: 1 },
      text: {
        fr: { label: 'Nouvelle erreur', detail: name, tag: 'NOUVELLE' },
        en: { label: 'New error', detail: name, tag: 'NEW' },
      },
    };
  }

  const lastSeen = Date.parse(issue.lastSeen);

  return {
    ...common,
    id: `${issue.id}-recurring-${hourOf(lastSeen)}`,
    at: new Date(lastSeen),
    rarity: 'common',
    text: {
      fr: { label: 'Erreur récurrente', detail: `${name}, ${issue.count} occurrences`, tag: `${issue.count} FOIS` },
      en: { label: 'Recurring error', detail: `${name}, ${issue.count} events`, tag: `${issue.count} TIMES` },
    },
  };
}
