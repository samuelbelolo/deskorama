import type { ConnectorConfig } from '@deskorama/core';

/** The keys of a PostHog Source's values, and of the sign-up events among its lists. */
export const POSTHOG_FIELDS = {
  host: 'host',
  project: 'project',
  signupEvents: 'signupEvents',
} as const;

/** The key under which a Source saved for one sign-up event keeps its name. */
export const POSTHOG_SIGNUP_EVENT_FIELD = 'signupEvent';

/** The scope a personal API key needs to run a query, named as in PostHog's settings. */
export const QUERY_READ = 'Query: Read';

/**
 * What a person fills in to connect PostHog: their cloud (US and EU are separate, a self-hosted copy has its own
 * address), the project's id, typed since listing projects would ask the key for a second scope, and the events
 * their product captures on sign-up, picked among the names the project received lately; the token is a personal
 * API key with the Query Read scope only. Polled every 2 minutes by default: each poll is one query, far under the
 * 2,400 an hour PostHog allows a project and shares with the whole organisation, and it reads only today's events,
 * since PostHog also budgets what queries read.
 */
export const POSTHOG_CONFIG: ConnectorConfig = {
  fields: [
    {
      key: POSTHOG_FIELDS.host,
      kind: 'choice',
      label: { fr: 'Cloud PostHog', en: 'PostHog cloud' },
      choices: [
        { value: 'https://us.posthog.com', label: { fr: 'Cloud US', en: 'US Cloud' } },
        { value: 'https://eu.posthog.com', label: { fr: 'Cloud EU', en: 'EU Cloud' } },
      ],
      other: {
        label: { fr: 'Auto-hébergé', en: 'Self-hosted' },
        kind: 'url',
        placeholder: 'https://posthog.kavelo.example',
      },
    },
    {
      key: POSTHOG_FIELDS.project,
      kind: 'text',
      label: { fr: 'Identifiant du projet', en: 'Project ID' },
      hint: {
        fr: 'Le nombre après /project/ dans l’adresse de PostHog.',
        en: 'The number after /project/ in PostHog’s address.',
      },
      placeholder: '12345',
    },
    {
      key: POSTHOG_FIELDS.signupEvents,
      kind: 'pick-many',
      needs: [POSTHOG_FIELDS.host, POSTHOG_FIELDS.project],
      formerly: POSTHOG_SIGNUP_EVENT_FIELD,
      label: { fr: 'Événements d’inscription', en: 'Sign-up events' },
      hint: {
        fr: 'Le nom des événements que votre produit envoie à l’inscription.',
        en: 'The names of the events your product captures on sign-up.',
      },
      placeholder: 'user_signed_up',
      counted: {
        fr: { one: '1 événement d’inscription', many: '{count} événements d’inscription' },
        en: { one: '1 sign-up event', many: '{count} sign-up events' },
      },
    },
  ],
  permissions: [
    {
      name: QUERY_READ,
      why: {
        fr: 'Compter les actifs et les inscriptions du jour, lister les noms d’événements. Aucun événement n’est lu.',
        en: 'Count active people and today’s sign-ups, list event names. No event is ever read.',
      },
    },
  ],
  interval: { min: 60_000, default: 2 * 60_000, max: 15 * 60_000 },
};
