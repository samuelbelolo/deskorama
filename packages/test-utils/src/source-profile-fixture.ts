import type { SourceProfile } from '@deskorama/core';

/**
 * Returns Tramlo, a fictional private repository, as the engine knows a Source: its name and the words of its
 * Gauges in both languages.
 * @example
 * sourceProfileFixture().gauges.daily.text.en.short; // "COMMITS"
 * createEngine(host, { lang: 'fr', seed: 1, source: sourceProfileFixture() });
 */
export function sourceProfileFixture(): SourceProfile {
  return {
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
}
