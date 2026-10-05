import type { ConnectorAbout } from '@deskorama/core';
import { STRIPE_MARK } from './stripe-mark.ts';

/** How the Stripe Connector presents itself: restricted keys are created from the Dashboard's API keys page. */
export const STRIPE_ABOUT: ConnectorAbout = {
  logo: { ...STRIPE_MARK, markColour: '#fbfbfb', tileColour: '#635bff' },
  pitch: {
    fr: 'Paiements reçus et refusés, nouveaux abonnements.',
    en: 'Payments received and declined, new subscriptions.',
  },
  token: {
    name: { fr: 'Clé restreinte', en: 'Restricted key' },
    page: { site: 'Stripe', url: 'https://dashboard.stripe.com/apikeys' },
    note: {
      fr: 'Cliquez «\u00a0Create restricted key\u00a0», puis mettez Read sur ces ressources et rien d’autre.',
      en: 'Click “Create restricted key”, then set Read on these resources and nothing else.',
    },
  },
};
