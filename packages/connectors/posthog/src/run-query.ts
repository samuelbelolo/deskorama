import {
  ConnectorError,
  parsePayload,
  readJson,
  responseFailure,
  sendRequest,
  type PollInput,
  type StandardSchema,
} from '@deskorama/core';
import { POSTHOG_FIELDS, QUERY_READ } from './posthog-config.ts';
import { queryUrl } from './query-url.ts';

/**
 * Runs one query on the project a Source names, with its personal API key, and returns the answer validated by
 * `schema`. Nothing is sent when the cloud's address is not an `https://` one or the project's id not a number.
 * Throws the {@link ConnectorError} a failed answer means, a missing scope named Query Read.
 * @example
 * await runQuery(input, gaugeQuery(['user_signed_up']), GAUGE_ANSWER_SCHEMA, 'The PostHog counts');
 * // { results: [[14, 37]] }
 */
export async function runQuery<Output>(
  input: Pick<PollInput, 'settings' | 'fetch' | 'now'>,
  body: string,
  schema: StandardSchema<Output>,
  what: string,
): Promise<Output> {
  const { values, token } = input.settings;

  const url = queryUrl(values[POSTHOG_FIELDS.host]?.trim() ?? '', values[POSTHOG_FIELDS.project]?.trim() ?? '');

  if (url === null) {
    throw new ConnectorError(
      { kind: 'invalid-response' },
      'PostHog needs an https:// address and a numeric project ID.',
    );
  }

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const response = await sendRequest(input.fetch, url, { method: 'POST', headers, body });

  const failure = responseFailure(response, input.now, QUERY_READ);

  if (failure !== null) throw failure;

  return parsePayload(schema, await readJson(response, what), what);
}
