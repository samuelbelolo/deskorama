import type { ConnectorAbout } from '@deskorama/core';
import { SENTRY_MARK } from './sentry-mark.ts';

/** How the Sentry Connector presents itself: a personal token, whose "Issue & Event" row grants `event:read`. */
export const SENTRY_ABOUT: ConnectorAbout = {
  logo: { ...SENTRY_MARK, markColour: '#fbfbfb', tileColour: '#362d59' },
  pitch: {
    fr: 'Les nouvelles erreurs, et celles qui reviennent.',
    en: 'New errors, and the ones that come back.',
  },
  token: {
    name: { fr: 'Jeton personnel', en: 'Personal token' },
    page: { site: 'Sentry', url: 'https://sentry.io/settings/account/api/auth-tokens/' },
    note: {
      fr: 'Créez un jeton personnel avec «\u00a0Issue & Event\u00a0» sur Read, et rien d’autre.',
      en: 'Create a personal token with “Issue & Event” set to Read, and nothing else.',
    },
  },
};
