import type { ConnectorConfig } from '@deskorama/core';

/** The key of the Vercel project, by name or ID, among a Source's values. */
export const VERCEL_PROJECT_FIELD = 'project';

/** The scope a Vercel token is given: Vercel has no read-only token, so it is limited to the one project instead. */
export const VERCEL_PERMISSION = 'Project scope';

/**
 * What a person fills in to connect a Vercel project: its name or ID, and a token scoped to that project. Polled every
 * minute by default, and never more than twice a minute: Vercel allows hundreds of deployment reads a minute.
 */
export const VERCEL_CONFIG: ConnectorConfig = {
  fields: [
    {
      key: VERCEL_PROJECT_FIELD,
      kind: 'text',
      label: { fr: 'Projet Vercel (nom ou identifiant)', en: 'Vercel project (name or ID)' },
      placeholder: 'tramlo-web',
    },
  ],
  permissions: [
    {
      name: VERCEL_PERMISSION,
      why: {
        fr: 'Lire les déploiements du projet. Vercel n’a pas de jeton en lecture seule : limitez-le à ce seul projet.',
        en: 'Read the project’s deployments. Vercel has no read-only token, so limit it to this one project.',
      },
    },
  ],
  interval: { min: 30_000, default: 60_000, max: 15 * 60_000 },
};
