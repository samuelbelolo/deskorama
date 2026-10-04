import type { SourceEvent } from '@deskorama/core';
import { eventText } from './event-text.ts';
import { formatCount } from './format-count.ts';
import { githubEvent } from './github-event.ts';
import type { Scan } from './scan.ts';

/**
 * Returns the Event of a public repository's stars moving since the previous poll: new stars are a thumbs-up,
 * removed ones a departure. None on the first poll, with nothing to compare to, or when the count did not move.
 * GitHub's list of stargazers runs oldest first, so the count is compared rather than the list read. The id names
 * the move and the poll that saw it, so a count that comes back to an earlier value is still a new Event.
 * @example
 * starEvents(2416, 2418, scan);
 * // [{ kind: 'star.added', archetype: 'like', text: { en: { label: '2 new stars', detail: '2,418 stars in total', tag: '+2' } } }]
 */
export function starEvents(previous: number | null, stars: number, scan: Scan): SourceEvent[] {
  if (previous === null || previous === stars) return [];

  const moved = Math.abs(stars - previous);

  const detail = {
    fr: `${formatCount(stars, 'fr')} étoiles au total`,
    en: `${formatCount(stars, 'en')} stars in total`,
  };

  if (stars > previous) {
    const label =
      moved === 1
        ? { fr: 'Nouvelle étoile sur le dépôt', en: 'New star on the repository' }
        : { fr: `${moved} nouvelles étoiles`, en: `${moved} new stars` };

    return [
      githubEvent(scan.source, {
        id: `stars-${previous}-${stars}-${scan.since}`,
        kind: 'star.added',
        archetype: 'like',
        rarity: 'common',
        at: scan.now,
        text: eventText(label, detail, `+${moved}`),
      }),
    ];
  }

  const label =
    moved === 1
      ? { fr: 'Une étoile retirée', en: 'A star removed' }
      : { fr: `${moved} étoiles retirées`, en: `${moved} stars removed` };

  return [
    githubEvent(scan.source, {
      id: `unstars-${previous}-${stars}-${scan.since}`,
      kind: 'star.removed',
      archetype: 'departure',
      rarity: 'notable',
      at: scan.now,
      text: eventText(label, detail, `-${moved}`),
    }),
  ];
}
