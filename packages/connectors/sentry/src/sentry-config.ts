import type { ConnectorConfig } from '@deskorama/core';

/** The key of the Sentry organization's slug among a Source's values. */
export const SENTRY_ORGANIZATION_FIELD = 'organization';

/** The key of the project slugs among a Source's lists: none stands for every project of the organization. */
export const SENTRY_PROJECTS_FIELD = 'projects';

/** The key of the environment names among a Source's lists: none stands for every environment. */
export const SENTRY_ENVIRONMENTS_FIELD = 'environments';

/** The scope a poll needs, as Sentry names it: reading issues and events, and nothing else. */
export const SENTRY_PERMISSION = 'event:read';

/** The scope listing the organizations, their projects and their environments needs, as Sentry names it. */
export const SENTRY_LIST_PERMISSION = 'org:read';

/**
 * What a person fills in to connect Sentry: the organization, then the projects and the environments to follow, all
 * of them unless some are picked, and a personal token that reads issues and the organization. A token without
 * `org:read` still polls: the organization, the projects and the environments are then typed by hand. Polled every
 * minute by default, and never more than twice a minute: Sentry does not publish its limits.
 */
export const SENTRY_CONFIG: ConnectorConfig = {
  fields: [
    {
      key: SENTRY_ORGANIZATION_FIELD,
      kind: 'pick-one',
      needs: [],
      label: { fr: 'Organisation', en: 'Organization' },
      hint: {
        fr: 'Son identifiant, le début de son adresse (tramlo dans tramlo.sentry.io).',
        en: 'Its slug, the start of its address (tramlo in tramlo.sentry.io).',
      },
      placeholder: 'tramlo',
    },
    {
      key: SENTRY_PROJECTS_FIELD,
      kind: 'pick-many',
      needs: [SENTRY_ORGANIZATION_FIELD],
      label: { fr: 'Projets', en: 'Projects' },
      placeholder: 'tramlo-web',
      counted: {
        fr: { one: '1 projet', many: '{count} projets' },
        en: { one: '1 project', many: '{count} projects' },
      },
      none: { fr: 'Tous', en: 'All' },
    },
    {
      key: SENTRY_ENVIRONMENTS_FIELD,
      kind: 'pick-many',
      needs: [SENTRY_ORGANIZATION_FIELD],
      label: { fr: 'Environnements', en: 'Environments' },
      placeholder: 'production',
      counted: {
        fr: { one: '1 environnement', many: '{count} environnements' },
        en: { one: '1 environment', many: '{count} environments' },
      },
      none: { fr: 'Tous', en: 'All' },
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
    {
      name: SENTRY_LIST_PERMISSION,
      why: {
        fr: 'Lister l’organisation, ses projets et ses environnements.',
        en: 'List the organization, its projects and its environments.',
      },
    },
  ],
  interval: { min: 30_000, default: 60_000, max: 15 * 60_000 },
};
