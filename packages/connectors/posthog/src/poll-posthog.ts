import {
  ConnectorError,
  parsePayload,
  readJson,
  responseFailure,
  sendRequest,
  type PollInput,
  type PollResult,
} from '@deskorama/core';
import { GAUGE_ANSWER_SCHEMA } from './gauge-answer-schema.ts';
import { gaugeQuery } from './gauge-query.ts';
import { POSTHOG_FIELDS, QUERY_READ } from './posthog-config.ts';
import { queryUrl } from './query-url.ts';

/**
 * Polls PostHog once: one counting query with the personal API key, whose two counts become the crowd and today's
 * count. It never returns an Event and needs no cursor, since each poll counts afresh.
 * @example
 * await pollPostHog({ settings: { name: 'Kavelo', values: { host, project: '12345', signupEvent: 'user_signed_up' },
 *   token: 'phx_…' }, cursor: null, fetch, now });
 * // { events: [], gauges: { crowd: 14, daily: 37 }, cursor: null }
 */
export async function pollPostHog(input: PollInput): Promise<PollResult> {
  const { values, token } = input.settings;

  const value = (key: string) => values[key]?.trim() ?? '';

  const url = queryUrl(value(POSTHOG_FIELDS.host), value(POSTHOG_FIELDS.project));

  const signup = value(POSTHOG_FIELDS.signupEvent);

  if (url === null || signup === '') {
    throw new ConnectorError(
      { kind: 'invalid-response' },
      'PostHog needs an https:// address, a numeric project ID and a sign-up event.',
    );
  }

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const response = await sendRequest(input.fetch, url, { method: 'POST', headers, body: gaugeQuery(signup) });

  const failure = responseFailure(response, input.now, QUERY_READ);

  if (failure !== null) throw failure;

  const what = 'The PostHog counts';

  const answer = await parsePayload(GAUGE_ANSWER_SCHEMA, await readJson(response, what), what);

  const [activeNow, signupsToday] = answer.results[0];

  return { events: [], gauges: { crowd: activeNow, daily: signupsToday }, cursor: null };
}
