import type { SourceEvent } from '../src/source-event.ts';
import type { SourceProfile } from '../src/source-profile.ts';

/** Tramlo, a fictional private repository, with the words of its Gauges. */
export const TRAMLO: SourceProfile = {
  name: 'Tramlo',
  gauges: {
    crowd: {
      max: 14,
      text: {
        fr: { label: 'Contributeurs actifs sur la dernière heure', short: 'ACTIFS' },
        en: { label: 'Contributors active in the last hour', short: 'ACTIVE' },
      },
    },
    daily: {
      text: {
        fr: { label: 'Commits aujourd’hui', short: 'COMMITS' },
        en: { label: 'Commits today', short: 'COMMITS' },
      },
    },
    total: {
      text: { fr: { label: 'Issues ouvertes', short: 'ISSUES' }, en: { label: 'Open issues', short: 'ISSUES' } },
    },
  },
};

/**
 * Returns an Event of Tramlo: by default a pull request merged on 4 October 2026 at 14:00 UTC. Any field can be
 * overridden.
 * @example
 * tramloEvent({ id: 'push-1', kind: 'push.main', gauge: { role: 'daily', by: 3 } });
 */
export function tramloEvent(overrides: Partial<SourceEvent> = {}): SourceEvent {
  return {
    id: 'tramlo-pr-418-merged',
    kind: 'pull_request.merged',
    archetype: 'approval',
    recognised: true,
    rarity: 'notable',
    source: 'Tramlo',
    at: new Date(Date.UTC(2026, 9, 4, 14)),
    text: {
      fr: { label: 'Pull request mergée', detail: '#418 Corrige la connexion Google', tag: 'MERGÉE' },
      en: { label: 'Pull request merged', detail: '#418 Fixes Google sign-in', tag: 'MERGED' },
    },
    ...overrides,
  };
}
