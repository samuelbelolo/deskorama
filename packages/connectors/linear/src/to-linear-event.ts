import type { SourceEvent } from '@deskorama/core';
import type { LinearIssue } from './linear-issues.ts';

/** The kinds of Event a Linear workspace produces: an issue created, and an issue completed. */
export type LinearKind = 'issue.created' | 'issue.completed';

/** The longest title a detail quotes, in characters: a longer one is cut at a word. */
const MAX_TITLE = 80;

/** The longest tag a Theme paints, about 12 characters as the Event text says. */
const MAX_TAG = 12;

/**
 * Returns the Event of an issue, worded in both languages: its identifier and short title, never who wrote it or
 * who works on it. A new issue is a message; a completed one is approved work and raises today's count. `id` makes
 * the Event unique.
 * @example
 * toLinearEvent('issue.completed', issue, 'f3a9-completed', 1791121980000, 'Tramlo').text.en;
 * // { label: 'Issue completed', detail: 'ENG-139 Retry failed webhooks', tag: 'DONE' }
 */
export function toLinearEvent(
  kind: LinearKind,
  issue: LinearIssue,
  id: string,
  at: number,
  source: string,
): SourceEvent {
  const title = shorten(issue.title);

  const common = { id, kind, recognised: true, source, at: new Date(at) } as const;

  if (kind === 'issue.created') {
    const tag = Array.from(issue.identifier).length <= MAX_TAG ? issue.identifier : '';

    return {
      ...common,
      archetype: 'message',
      rarity: 'common',
      text: {
        fr: { label: 'Issue créée', detail: `« ${title} »`, tag },
        en: { label: 'Issue created', detail: `“${title}”`, tag },
      },
    };
  }

  return {
    ...common,
    archetype: 'approval',
    rarity: 'notable',
    gauge: { role: 'daily', by: 1 },
    text: {
      fr: { label: 'Issue terminée', detail: `${issue.identifier} ${title}`, tag: 'TERMINÉE' },
      en: { label: 'Issue completed', detail: `${issue.identifier} ${title}`, tag: 'DONE' },
    },
  };
}

/**
 * Returns a title short enough for a detail: as it is, or cut at the last space before the limit, with an ellipsis.
 * @example
 * shorten('Retry failed webhooks'); // 'Retry failed webhooks'
 */
function shorten(title: string): string {
  const characters = Array.from(title.trim());

  if (characters.length <= MAX_TITLE) return characters.join('');

  // One character past the limit, so a word ending right at it is kept whole.
  const room = characters.slice(0, MAX_TITLE + 1).join('');

  const space = room.lastIndexOf(' ');

  const cut = space > 0 ? room.slice(0, space) : characters.slice(0, MAX_TITLE).join('');

  return `${cut.trimEnd()}…`;
}
