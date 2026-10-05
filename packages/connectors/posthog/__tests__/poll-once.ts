import type { PollResult, SourceSettings } from '@deskorama/core';
import { createFakeFetch, FIXTURE_TIME, inOrder, type RecordedResponse, type SentRequest } from '@deskorama/test-utils';
import { createPostHog } from '../src/create-posthog.ts';
import { KAVELO_POSTHOG } from './kavelo-posthog.ts';

/** One poll of the PostHog Connector: its result and the requests it sent. */
export interface PolledOnce {
  readonly result: PollResult;
  readonly sent: readonly SentRequest[];
}

/**
 * Polls Kavelo's PostHog project once with `settings`, through a fake `fetch` answering `recording`, and returns the
 * result with the requests sent.
 * @example
 * const { result, sent } = await pollOnce(recordedPostHog('counts.json'));
 * // result: { events: [], gauges: { crowd: 14, daily: 37 }, cursor: null }, sent[0].init.method: 'POST'
 */
export async function pollOnce(
  recording: RecordedResponse,
  settings: SourceSettings = KAVELO_POSTHOG,
): Promise<PolledOnce> {
  const fake = createFakeFetch(inOrder([recording]));

  const result = await createPostHog().poll({ settings, cursor: null, fetch: fake.fetch, now: FIXTURE_TIME });

  return { result, sent: fake.sent };
}
