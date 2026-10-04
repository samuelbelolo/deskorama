import type { SourceProfile } from '@deskorama/core';

/**
 * The words of a PostHog Source's Gauges: the people active in the last minutes fill the crowd, and today's sign-ups
 * the daily count. The total, the accounts ever created, is not counted by the query, which stays small: another
 * Source moves it. A short label is a noun: the Theme adds when it counts (now, today, in total).
 */
export const POSTHOG_GAUGES: SourceProfile['gauges'] = {
  crowd: {
    max: 50,
    text: {
      fr: { label: 'Personnes actives', short: 'ACTIFS' },
      en: { label: 'People active', short: 'ACTIVE' },
    },
  },
  daily: {
    text: {
      fr: { label: 'Inscriptions aujourd’hui', short: 'INSCRITS' },
      en: { label: 'Sign-ups today', short: 'SIGN-UPS' },
    },
  },
  total: {
    text: {
      fr: { label: 'Comptes créés', short: 'COMPTES' },
      en: { label: 'Accounts created', short: 'ACCOUNTS' },
    },
  },
};
