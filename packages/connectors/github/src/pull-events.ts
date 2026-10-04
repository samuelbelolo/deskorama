import type { SourceEvent } from '@deskorama/core';
import { clip } from './clip.ts';
import { eventText } from './event-text.ts';
import { githubEvent } from './github-event.ts';
import { DETAIL_LENGTH } from './limits.ts';
import { pullDetail } from './pull-detail.ts';
import type { Pull } from './pull-schema.ts';
import type { Scan } from './scan.ts';

/** How GitHub marks the author of someone's first pull request to a repository. */
const FIRST_TIMERS = new Set(['FIRST_TIME_CONTRIBUTOR', 'FIRST_TIMER']);

/**
 * Returns what happened to a pull request since `scan.since`, oldest first: opened, then merged or closed unmerged.
 * Its detail is its number and title, never its author.
 * @example
 * pullEvents({ number: 412, title: 'Add PDF export', merged_at: t, … }, scan);
 * // [{ kind: 'pull_request.merged', archetype: 'approval', text: { en: { tag: 'MERGED', … } }, … }]
 */
export function pullEvents(pull: Pull, scan: Scan): SourceEvent[] {
  const detail = pullDetail(pull);

  const events: SourceEvent[] = [];

  if (pull.created_at > scan.since) events.push(openedEvent(pull, detail, scan));

  if (pull.merged_at !== null && pull.merged_at > scan.since) {
    events.push(
      githubEvent(scan.source, {
        id: `pr-${pull.number}-merged`,
        kind: 'pull_request.merged',
        archetype: 'approval',
        rarity: 'notable',
        at: pull.merged_at,
        text: eventText({ fr: 'Pull request mergée', en: 'Pull request merged' }, detail, {
          fr: 'MERGÉE',
          en: 'MERGED',
        }),
      }),
    );
  } else if (pull.merged_at === null && pull.closed_at !== null && pull.closed_at > scan.since) {
    events.push(
      githubEvent(scan.source, {
        id: `pr-${pull.number}-closed`,
        kind: 'pull_request.closed',
        archetype: 'abandon',
        rarity: 'common',
        at: pull.closed_at,
        text: eventText({ fr: 'Pull request fermée sans merge', en: 'Pull request closed unmerged' }, detail, {
          fr: 'FERMÉE',
          en: 'CLOSED',
        }),
      }),
    );
  }

  return events;
}

/**
 * Returns the Event of an opened pull request: someone's first one on a public repository is a newcomer joining,
 * any other an arrival.
 * @example
 * openedEvent({ number: 418, author_association: 'MEMBER', … }, '#418 Fix sign-in', scan);
 * // { kind: 'pull_request.opened', archetype: 'arrival', text: { en: { tag: '#418', … } }, … }
 */
function openedEvent(pull: Pull, detail: string, scan: Scan): SourceEvent {
  const id = `pr-${pull.number}-opened`;

  if (scan.visibility === 'public' && FIRST_TIMERS.has(pull.author_association)) {
    const first = { fr: `Première PR : ${pull.title}`, en: `First PR: ${pull.title}` };

    return githubEvent(scan.source, {
      id,
      kind: 'contributor.first',
      archetype: 'partner',
      rarity: 'notable',
      at: pull.created_at,
      text: eventText(
        { fr: 'Premier contributeur extérieur', en: 'First-time contributor' },
        { fr: clip(first.fr, DETAIL_LENGTH), en: clip(first.en, DETAIL_LENGTH) },
        { fr: 'BIENVENUE', en: 'WELCOME' },
      ),
    });
  }

  return githubEvent(scan.source, {
    id,
    kind: 'pull_request.opened',
    archetype: 'arrival',
    rarity: 'common',
    at: pull.created_at,
    text: eventText({ fr: 'Pull request ouverte', en: 'Pull request opened' }, detail, `#${pull.number}`),
  });
}
