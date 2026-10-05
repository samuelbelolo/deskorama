import { ConnectorError, pickedValues, type PollInput, type PollResult } from '@deskorama/core';
import { GAUGE_ANSWER_SCHEMA } from './gauge-answer-schema.ts';
import { gaugeQuery } from './gauge-query.ts';
import { POSTHOG_FIELDS, POSTHOG_SIGNUP_EVENT_FIELD } from './posthog-config.ts';
import { runQuery } from './run-query.ts';

/**
 * Polls PostHog once: one counting query with the personal API key, whose two counts become the crowd and today's
 * count, the sign-ups under any of the Source's sign-up events. A Source saved for a single event still counts that
 * one. It never returns an Event and needs no cursor, since each poll counts afresh.
 * @example
 * await pollPostHog({ settings: { name: 'Kavelo', values: { host, project: '12345' },
 *   lists: { signupEvents: ['user_signed_up', 'team_created'] }, token: 'phx_…' }, cursor: null, fetch, now });
 * // { events: [], gauges: { crowd: 14, daily: 37 }, cursor: null }
 */
export async function pollPostHog(input: PollInput): Promise<PollResult> {
  const signupEvents = pickedValues(input.settings, POSTHOG_FIELDS.signupEvents, POSTHOG_SIGNUP_EVENT_FIELD);

  if (signupEvents.length === 0) {
    throw new ConnectorError({ kind: 'invalid-response' }, 'A PostHog Source names at least one sign-up event.');
  }

  const answer = await runQuery(input, gaugeQuery(signupEvents), GAUGE_ANSWER_SCHEMA, 'The PostHog counts');

  const [activeNow, signupsToday] = answer.results[0];

  return { events: [], gauges: { crowd: activeNow, daily: signupsToday }, cursor: null };
}
