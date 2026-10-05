import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SourceSettings } from '@deskorama/core';
import type { RecordedResponse } from '@deskorama/test-utils';

/**
 * The PostHog project of Kavelo, a fictional subscription product, as a Source saved for a single sign-up event
 * keeps it: a typed address and one event name among its values.
 */
export const KAVELO_POSTHOG: SourceSettings = {
  name: 'Kavelo',
  values: { host: 'https://eu.posthog.com', project: '12345', signupEvent: 'user_signed_up' },
  token: 'phx_kavelo-personal-key-for-tests',
};

/** Kavelo's project counting two sign-up events, as a person picks them from the list. */
export const KAVELO_SIGNUPS: SourceSettings = {
  name: 'Kavelo',
  values: { host: 'https://eu.posthog.com', project: '12345' },
  lists: { signupEvents: ['user_signed_up', 'team_created'] },
  token: 'phx_kavelo-personal-key-for-tests',
};

/**
 * Returns a recorded answer of PostHog whose body is one of the recordings beside this file.
 * @example
 * recordedPostHog('counts.json'); // { status: 200, headers: { … }, body: { results: [[14, 37]], … } }
 * recordedPostHog('missing-scope.json', 403); // { status: 403, …, body: { code: 'permission_denied', … } }
 */
export function recordedPostHog(
  recording: string,
  status = 200,
  headers: Readonly<Record<string, string>> = {},
): RecordedResponse {
  const body: unknown = JSON.parse(readFileSync(join(import.meta.dirname, 'recordings', recording), 'utf8'));

  return { status, headers: { 'Content-Type': 'application/json', ...headers }, body };
}
