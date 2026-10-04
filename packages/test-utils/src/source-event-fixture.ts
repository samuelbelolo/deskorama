import type { SourceEvent } from '@deskorama/core';

/** 4 October 2026, 14:00 UTC: the fixed instant every fixture happens at. */
export const FIXTURE_TIME: number = Date.UTC(2026, 9, 4, 14, 0);

/**
 * Returns an Event as a Connector produces it: by default a pull request merged in "Tramlo", a fictional
 * private repository. Any field can be overridden; optional fields are left out unless given.
 * @example
 * sourceEventFixture().text.en.label; // "Pull request merged"
 * sourceEventFixture({ archetype: null, recognised: false }).archetype; // null
 */
export function sourceEventFixture(overrides: Partial<SourceEvent> = {}): SourceEvent {
  return {
    id: 'tramlo-pr-418-merged',
    kind: 'pull_request.merged',
    archetype: 'approval',
    recognised: true,
    rarity: 'notable',
    source: 'Tramlo',
    at: new Date(FIXTURE_TIME),
    text: {
      fr: { label: 'Pull request mergée', detail: '#418 Corrige la connexion Google', tag: 'MERGÉE' },
      en: { label: 'Pull request merged', detail: '#418 Fixes Google sign-in', tag: 'MERGED' },
    },
    ...overrides,
  };
}
