import type { ConnectorOption } from '@deskorama/core';
import * as v from 'valibot';

/** A name or a slug as Sentry gives it: never empty. */
const NAMED = v.pipe(v.string(), v.nonEmpty());

/**
 * The answer of `GET /api/0/organizations/`: the organizations the token can see, each read by its name and kept
 * by its slug. Only those two fields are checked, so Sentry may add others.
 * @example
 * [{ "id": "4507", "slug": "tramlo", "name": "Tramlo", "status": { "id": "active", "name": "active" } }]
 */
export const ORGANIZATION_OPTIONS_SCHEMA: v.GenericSchema<unknown, ConnectorOption[]> = v.pipe(
  v.array(v.object({ slug: NAMED, name: NAMED })),
  v.transform((organizations) => organizations.map(({ slug, name }) => ({ value: slug, label: name }))),
);

/**
 * The answer of `GET /api/0/organizations/{organization}/projects/`: the organization's projects, each by its slug,
 * which is how Sentry shows a project and filters issues on it.
 * @example
 * [{ "id": "17", "slug": "tramlo-web", "name": "tramlo-web", "platform": "javascript-nextjs" }]
 */
export const PROJECT_OPTIONS_SCHEMA: v.GenericSchema<unknown, ConnectorOption[]> = v.pipe(
  v.array(v.object({ slug: NAMED })),
  v.transform((projects) => projects.map(({ slug }) => ({ value: slug, label: slug }))),
);

/**
 * The answer of `GET /api/0/organizations/{organization}/environments/`: the environments its projects reported
 * errors from, each by its name. Events sent without an environment show as one with no name, which cannot be
 * picked.
 * @example
 * [{ "id": "301", "name": "production" }, { "id": "302", "name": "staging" }]
 */
export const ENVIRONMENT_OPTIONS_SCHEMA: v.GenericSchema<unknown, ConnectorOption[]> = v.pipe(
  v.array(v.object({ name: v.string() })),
  v.transform((environments) =>
    environments.filter(({ name }) => name.trim() !== '').map(({ name }) => ({ value: name, label: name })),
  ),
);
