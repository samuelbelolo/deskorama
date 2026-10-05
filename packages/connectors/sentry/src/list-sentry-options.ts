import { ConnectorError, type ConnectorOption, type OptionsInput } from '@deskorama/core';
import { readSentryList, type SentryList } from './read-sentry-list.ts';
import { SENTRY_ENVIRONMENTS_FIELD, SENTRY_ORGANIZATION_FIELD, SENTRY_PROJECTS_FIELD } from './sentry-config.ts';
import {
  ENVIRONMENT_OPTIONS_SCHEMA,
  ORGANIZATION_OPTIONS_SCHEMA,
  PROJECT_OPTIONS_SCHEMA,
} from './sentry-option-schemas.ts';
import { sentryOrganization } from './sentry-organization.ts';

/**
 * Returns what a person picks from to connect Sentry: the organizations the token can see, or, once one is chosen,
 * its projects or the environments they report errors from, in alphabetical order. Each list needs `org:read`, one
 * scope more than a poll. Throws the {@link ConnectorError} a failed answer means.
 * @example
 * await listSentryOptions({ field: 'organization', settings: { name: '', values: {}, token }, fetch, now });
 * // [{ value: 'tramlo', label: 'Tramlo' }]
 * await listSentryOptions({ field: 'environments', settings: { name: '', values: { organization: 'tramlo' }, token }, fetch, now });
 * // [{ value: 'production', label: 'production' }, { value: 'staging', label: 'staging' }]
 */
export async function listSentryOptions(input: OptionsInput): Promise<ConnectorOption[]> {
  const options = await readSentryList(input, listOf(input));

  return options.toSorted((a, b) => a.label.localeCompare(b.label));
}

/**
 * Returns where the options of the field asked for are read, and how. A list of an organization needs its slug;
 * throws an `invalid-response` {@link ConnectorError} without it, or for a field Sentry lists nothing for.
 * @example
 * listOf({ field: 'projects', settings: { name: '', values: { organization: 'tramlo' }, token }, fetch, now }).path;
 * // '/organizations/tramlo/projects/'
 */
function listOf(input: OptionsInput): SentryList {
  if (input.field === SENTRY_ORGANIZATION_FIELD) {
    return { path: '/organizations/', schema: ORGANIZATION_OPTIONS_SCHEMA, what: 'The organizations' };
  }

  const organization = sentryOrganization(input.settings);

  const root = `/organizations/${encodeURIComponent(organization)}`;

  if (input.field === SENTRY_PROJECTS_FIELD) {
    return { path: `${root}/projects/`, schema: PROJECT_OPTIONS_SCHEMA, what: 'The projects' };
  }

  if (input.field === SENTRY_ENVIRONMENTS_FIELD) {
    return { path: `${root}/environments/`, schema: ENVIRONMENT_OPTIONS_SCHEMA, what: 'The environments' };
  }

  throw new ConnectorError({ kind: 'invalid-response' }, `Sentry lists no options for ${input.field}.`);
}
