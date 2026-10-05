import { ConnectorError, type SourceSettings } from '@deskorama/core';
import { SENTRY_ORGANIZATION_FIELD } from './sentry-config.ts';

/**
 * Returns the slug of the organization a Source names, without the spaces around it. Throws an `invalid-response`
 * {@link ConnectorError} when it is missing or empty, so a poll and a list refuse the same settings.
 * @example
 * sentryOrganization({ values: { organization: ' tramlo ' } }); // 'tramlo'
 * sentryOrganization({ values: {} }); // throws ConnectorError { failure: { kind: 'invalid-response' } }
 */
export function sentryOrganization(settings: Pick<SourceSettings, 'values'>): string {
  const organization = settings.values[SENTRY_ORGANIZATION_FIELD]?.trim() ?? '';

  if (organization === '') {
    throw new ConnectorError({ kind: 'invalid-response' }, 'Sentry needs the organization.');
  }

  return organization;
}
