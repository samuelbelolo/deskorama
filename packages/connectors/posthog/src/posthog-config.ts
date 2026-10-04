import type { ConnectorConfig } from '@deskorama/core';

/** The keys of a PostHog Source's values. */
export const POSTHOG_FIELDS = {
  host: 'host',
  project: 'project',
  signupEvent: 'signupEvent',
} as const;

/** The scope a personal API key needs to run a query, named as in PostHog's settings. */
export const QUERY_READ = 'Query: Read';

/**
 * What a person fills in to connect PostHog: the address of their cloud (US and EU are separate), the project's id
 * and the event their product captures on sign-up; the token is a personal API key with the Query Read scope only.
 * Polled every 2 minutes by default: each poll is one query, far under the 2,400 an hour PostHog allows a project and
 * shares with the whole organisation, and it reads only today's events, since PostHog also budgets what queries read.
 */
export const POSTHOG_CONFIG: ConnectorConfig = {
  fields: [
    {
      key: POSTHOG_FIELDS.host,
      kind: 'url',
      label: { fr: 'Adresse de PostHog (US ou EU)', en: 'PostHog address (US or EU)' },
      placeholder: 'https://eu.posthog.com',
    },
    {
      key: POSTHOG_FIELDS.project,
      kind: 'text',
      label: { fr: 'Identifiant du projet', en: 'Project ID' },
      placeholder: '12345',
    },
    {
      key: POSTHOG_FIELDS.signupEvent,
      kind: 'text',
      label: { fr: 'Événement d’inscription', en: 'Sign-up event' },
      placeholder: 'user_signed_up',
    },
  ],
  permissions: [
    {
      name: QUERY_READ,
      why: {
        fr: 'Compter les personnes actives et les inscriptions du jour, sans lire aucun événement.',
        en: 'Count active people and today’s sign-ups, without reading any event.',
      },
    },
  ],
  interval: { min: 60_000, default: 2 * 60_000, max: 15 * 60_000 },
};
