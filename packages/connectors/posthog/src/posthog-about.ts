import type { ConnectorAbout } from '@deskorama/core';
import { POSTHOG_FIELDS } from './posthog-config.ts';
import { POSTHOG_MARK } from './posthog-mark.ts';

/**
 * How the PostHog Connector presents itself. The US and EU clouds are separate, so the token page opens on the
 * address the person typed, at the path of this one.
 */
export const POSTHOG_ABOUT: ConnectorAbout = {
  logo: { ...POSTHOG_MARK, markColour: '#1d1f27', tileColour: '#f3f1ea' },
  pitch: {
    fr: 'Les compteurs seulement\u00a0: personnes actives, inscriptions du jour.',
    en: 'Gauges only: people active, today’s sign-ups.',
  },
  token: {
    name: { fr: 'Clé d’API personnelle', en: 'Personal API key' },
    page: {
      site: 'PostHog',
      url: 'https://us.posthog.com/settings/user-api-keys',
      originField: POSTHOG_FIELDS.host,
    },
    note: {
      fr: 'Une clé d’API personnelle avec la seule portée «\u00a0Query:\u00a0Read\u00a0».',
      en: 'A personal API key with the “Query:\u00a0Read” scope only.',
    },
  },
};
