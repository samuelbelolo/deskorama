import type { ConnectorConfig } from '@deskorama/core';

/** The key of the Vercel projects, by ID, among a Source's lists. */
export const VERCEL_PROJECTS_FIELD = 'projects';

/** The key under which a Source saved for one project keeps it, by name or ID. */
export const VERCEL_PROJECT_FIELD = 'project';

/** How many projects one deployments request can filter on, as Vercel documents it. */
export const MAX_PROJECTS = 20;

/**
 * The scope a Vercel token is given: Vercel has no read-only token, and a token limited to one project can neither
 * list the team's projects nor read another one, so it is limited to the team instead.
 */
export const VERCEL_PERMISSION = 'Team scope';

/**
 * What a person fills in to connect Vercel: the projects to follow, picked among those the token can see, and a
 * token scoped to their team. Polled every minute by default, and never more than twice a minute: Vercel allows
 * hundreds of deployment reads a minute.
 */
export const VERCEL_CONFIG: ConnectorConfig = {
  fields: [
    {
      key: VERCEL_PROJECTS_FIELD,
      kind: 'pick-many',
      needs: [],
      formerly: VERCEL_PROJECT_FIELD,
      max: MAX_PROJECTS,
      label: { fr: 'Projets Vercel', en: 'Vercel projects' },
      hint: {
        fr: 'Le nom d’un projet, ou les identifiants (prj_…) de plusieurs.',
        en: 'One project’s name, or the IDs (prj_…) of several.',
      },
      placeholder: 'tramlo-web',
      counted: {
        fr: { one: '1 projet', many: '{count} projets' },
        en: { one: '1 project', many: '{count} projects' },
      },
    },
  ],
  permissions: [
    {
      name: VERCEL_PERMISSION,
      why: {
        fr: 'Lire les projets de l’équipe et leurs déploiements. Vercel n’a pas de jeton en lecture seule.',
        en: 'Read the team’s projects and their deployments. Vercel has no read-only token.',
      },
    },
  ],
  interval: { min: 30_000, default: 60_000, max: 15 * 60_000 },
};
