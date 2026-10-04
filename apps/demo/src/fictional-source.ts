import type { GaugeValues, SourceProfile } from '@deskorama/core';

/** Tramlo, the demo's fictional private repository, with the words of its Gauges. Every number is invented. */
export const FICTIONAL_SOURCE: SourceProfile = {
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

/** What Tramlo's Gauges read when the demo opens, as if a Connector had just polled it. */
export const FICTIONAL_GAUGES: GaugeValues = { crowd: 4, daily: 23, total: 37, build: 'idle' };
