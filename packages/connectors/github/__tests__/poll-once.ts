import type { Connector, PollResult, SourceSettings } from '@deskorama/core';
import { createFakeFetch, FIXTURE_TIME, type Responder, type SentRequest } from '@deskorama/test-utils';

/** One minute, between two polls. */
export const MINUTE = 60_000;

/** One poll of a GitHub Connector: its result and the requests it sent. */
export interface PolledOnce {
  readonly result: PollResult;
  readonly sent: readonly SentRequest[];
}

/**
 * Polls `connector` once through a fake `fetch` answered by `respond`, from `cursor`, `later` milliseconds after
 * the fixture's time.
 * @example
 * const { result, sent } = await pollOnce(createGithub(), TRAMLO_APP, answerFrom(repo, firstPollOfApp()));
 */
export async function pollOnce(
  connector: Connector,
  settings: SourceSettings,
  respond: Responder,
  cursor: string | null = null,
  later = 0,
): Promise<PolledOnce> {
  const fake = createFakeFetch(respond);

  const result = await connector.poll({ settings, cursor, fetch: fake.fetch, now: FIXTURE_TIME + later });

  return { result, sent: fake.sent };
}
