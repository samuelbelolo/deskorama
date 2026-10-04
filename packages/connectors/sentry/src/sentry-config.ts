import type { ConnectorConfig } from '@deskorama/core';

/** The key of the Sentry organization's slug among a Source's values. */
export const SENTRY_ORGANIZATION_FIELD = 'organization';

/** The scope the token needs, as Sentry names it: reading issues and events, and nothing else. */
export const SENTRY_PERMISSION = 'event:read';

/**
 * What a person fills in to connect a Sentry organization: its slug, and a personal token with `event:read`.
 * Polled every minute by default, and never more than twice a minute: Sentry does not publish its limits.
 */
export const SENTRY_CONFIG: ConnectorConfig = {
  fields: [
    {
      key: SENTRY_ORGANIZATION_FIELD,
      kind: 'text',
      label: { fr: 'Organisation Sentry (son slug)', en: 'Sentry organization (its slug)' },
      placeholder: 'tramlo',
    },
  ],
  permissions: [
    {
      name: SENTRY_PERMISSION,
      why: {
        fr: 'Lire les erreurs de l’organisation, sans pouvoir les modifier.',
        en: 'Read the organization’s errors, without changing them.',
      },
    },
  ],
  interval: { min: 30_000, default: 60_000, max: 15 * 60_000 },
};
