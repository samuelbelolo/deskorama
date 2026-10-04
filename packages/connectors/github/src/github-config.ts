import type { ConnectorConfig } from '@deskorama/core';
import {
  ACTIONS_PERMISSION,
  CONTENTS_PERMISSION,
  DEPLOYMENTS_PERMISSION,
  ISSUES_PERMISSION,
  METADATA_PERMISSION,
  PULL_REQUESTS_PERMISSION,
} from './github-permissions.ts';

/** The key of the repository, as `owner/name`, among a Source's values. */
export const REPOSITORY_FIELD = 'repository';

/**
 * What a person fills in to connect a GitHub repository: its `owner/name`, and a fine-grained token limited to
 * that repository with read-only access to six permissions. Polled every minute by default: a list that did not
 * change answers `304 Not Modified`, which GitHub does not count against the rate limit.
 */
export const GITHUB_CONFIG: ConnectorConfig = {
  fields: [
    {
      key: REPOSITORY_FIELD,
      kind: 'text',
      label: { fr: 'Dépôt (propriétaire/nom)', en: 'Repository (owner/name)' },
      placeholder: 'tramlo/tramlo-app',
    },
  ],
  permissions: [
    {
      name: METADATA_PERMISSION,
      why: {
        fr: 'Voir le dépôt : sa branche principale, ses étoiles et ses issues ouvertes.',
        en: 'See the repository: its default branch, its stars and its open issues.',
      },
    },
    {
      name: CONTENTS_PERMISSION,
      why: { fr: 'Lire les commits et les versions publiées.', en: 'Read commits and releases.' },
    },
    {
      name: PULL_REQUESTS_PERMISSION,
      why: { fr: 'Lire les pull requests et leurs revues.', en: 'Read pull requests and their reviews.' },
    },
    {
      name: ISSUES_PERMISSION,
      why: { fr: 'Lire les issues ouvertes.', en: 'Read opened issues.' },
    },
    {
      name: ACTIONS_PERMISSION,
      why: { fr: 'Lire les exécutions de la CI.', en: 'Read CI workflow runs.' },
    },
    {
      name: DEPLOYMENTS_PERMISSION,
      why: { fr: 'Lire les déploiements et leur état.', en: 'Read deployments and their state.' },
    },
  ],
  interval: { min: 30_000, default: 60_000, max: 15 * 60_000 },
};
