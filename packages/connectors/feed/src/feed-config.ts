import type { ConnectorConfig } from '@deskorama/core';

/** The key of the Feed's address among a Source's values. */
export const FEED_URL_FIELD = 'url';

/** The permission a Feed's token grants, named like an API scope: reading the Feed's Events, which the backend decides. */
export const FEED_PERMISSION = 'read:events';

/**
 * What a person fills in to connect a Feed: the HTTPS address of their backend; the token is the one their backend
 * expects as `Authorization: Bearer`. Polled every minute by default, never more than twice a minute.
 */
export const FEED_CONFIG: ConnectorConfig = {
  fields: [
    {
      key: FEED_URL_FIELD,
      kind: 'url',
      label: { fr: 'Adresse du flux', en: 'Feed address' },
      placeholder: 'https://api.tramlo.example/deskorama/events',
    },
  ],
  permissions: [
    {
      name: FEED_PERMISSION,
      why: {
        fr: 'Lire les événements du flux, et rien d’autre.',
        en: 'Read the Feed’s Events, and nothing else.',
      },
    },
  ],
  interval: { min: 30_000, default: 60_000, max: 15 * 60_000 },
};
