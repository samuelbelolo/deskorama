import { ConnectorError, type ConnectorOption, type OptionsInput } from '@deskorama/core';
import { EVENT_NAMES_SCHEMA } from './event-names-answer-schema.ts';
import { eventNamesQuery } from './event-names-query.ts';
import { POSTHOG_FIELDS } from './posthog-config.ts';
import { runQuery } from './run-query.ts';

/**
 * Returns the names of the events the project received lately, to pick the sign-up events from: the product's own
 * first, then those PostHog captures by itself, whose names start with `$`, each group in alphabetical order. A
 * name with spaces around it is left out: a picked value is kept without them, and a poll would count under a name
 * PostHog does not hold. One query of names with the same Query Read scope a poll needs, never an event. Throws the
 * {@link ConnectorError} a failed answer means.
 * @example
 * await listPostHogOptions({ field: 'signupEvents', settings: { name: '', values: { host, project: '12345' }, token }, fetch, now });
 * // [{ value: 'team_created', label: 'team_created' }, { value: 'user_signed_up', label: 'user_signed_up' }, { value: '$pageview', … }]
 */
export async function listPostHogOptions(input: OptionsInput): Promise<ConnectorOption[]> {
  if (input.field !== POSTHOG_FIELDS.signupEvents) {
    throw new ConnectorError({ kind: 'invalid-response' }, `PostHog lists no options for ${input.field}.`);
  }

  const answer = await runQuery(input, eventNamesQuery(), EVENT_NAMES_SCHEMA, 'The PostHog event names');

  const listed = answer.results.map(([name]) => name).filter((name) => name !== '' && name === name.trim());

  const names = [...new Set(listed)];

  return names.toSorted(byOwnFirst).map((name) => ({ value: name, label: name }));
}

/**
 * Orders two event names: a product's own before one PostHog captures by itself, then alphabetically.
 * @example
 * ['$pageview', 'user_signed_up', 'team_created'].toSorted(byOwnFirst); // ['team_created', 'user_signed_up', '$pageview']
 */
function byOwnFirst(a: string, b: string): number {
  const builtIn = Number(a.startsWith('$')) - Number(b.startsWith('$'));

  return builtIn === 0 ? a.localeCompare(b) : builtIn;
}
