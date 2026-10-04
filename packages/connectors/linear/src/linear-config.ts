import type { ConnectorConfig } from '@deskorama/core';

/** The permission a Linear API key is given, as Linear names it: reading the workspace, and nothing else. */
export const LINEAR_PERMISSION = 'Read';

/**
 * What a person fills in to connect a Linear workspace: nothing but an API key limited to Read, which also decides
 * the workspace and, if the person wishes, the teams. Polled every minute by default, and never more than twice a
 * minute: an API key may send 2,500 requests an hour.
 */
export const LINEAR_CONFIG: ConnectorConfig = {
  fields: [],
  permissions: [
    {
      name: LINEAR_PERMISSION,
      why: {
        fr: 'Lire les issues de l’espace de travail, sans pouvoir les modifier.',
        en: 'Read the workspace’s issues, without changing them.',
      },
    },
  ],
  interval: { min: 30_000, default: 60_000, max: 15 * 60_000 },
};
