import type { SourceEvent } from '@deskorama/core';
import { eventText } from './event-text.ts';
import { formatCount } from './format-count.ts';
import { githubEvent } from './github-event.ts';
import type { Scan } from './scan.ts';

/**
 * Returns the Event of a public repository forked since the previous poll, with its forks in total; null on the
 * first poll, or when no fork was added. The id names the move and the poll that saw it, as for stars.
 * @example
 * forkEvent(318, 319, scan);
 * // { kind: 'repository.forked', archetype: 'usage', text: { en: { detail: '319 forks in total', tag: 'FORK' } } }
 */
export function forkEvent(previous: number | null, forks: number, scan: Scan): SourceEvent | null {
  if (previous === null || forks <= previous) return null;

  return githubEvent(scan.source, {
    id: `forks-${previous}-${forks}-${scan.since}`,
    kind: 'repository.forked',
    archetype: 'usage',
    rarity: 'common',
    at: scan.now,
    text: eventText(
      { fr: 'Dépôt forké', en: 'Repository forked' },
      { fr: `${formatCount(forks, 'fr')} forks au total`, en: `${formatCount(forks, 'en')} forks in total` },
      'FORK',
    ),
  });
}
