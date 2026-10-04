import type { PollResult } from '@deskorama/core';
import { createFakeFetch, FIXTURE_TIME, inOrder, type RecordedResponse, type SentRequest } from '@deskorama/test-utils';
import { createSentry } from '../src/create-sentry.ts';
import { TRAMLO_SENTRY } from './tramlo-sentry.ts';

/** One minute, the usual time between two polls. */
const MINUTE = 60_000;

/** What a run of polls gave, and the requests they sent. */
export interface PolledAt {
  readonly results: PollResult[];
  readonly sent: readonly SentRequest[];
}

/**
 * Polls Tramlo's Sentry organization once per entry of `minutes`, each at that many minutes after the fixture time
 * and resuming from the cursor the previous poll returned, through a fake `fetch` answering `recordings` in order.
 * @example
 * const { results, sent } = await pollAt([recorded('issues-last-hour.json')], [0]);
 * results[0]?.events.length; // 2
 */
export async function pollAt(
  recordings: readonly RecordedResponse[],
  minutes: readonly number[],
  cursor: string | null = null,
): Promise<PolledAt> {
  const fake = createFakeFetch(inOrder(recordings));

  /**
   * Returns the results of the polls from the `index`th minute on, each resuming from the cursor of the one before.
   * @example
   * await pollFrom(null, 0); // [first, second, …]
   */
  const pollFrom = async (from: string | null, index: number): Promise<PollResult[]> => {
    const minute = minutes[index];

    if (minute === undefined) return [];

    const now = FIXTURE_TIME + minute * MINUTE;

    const result = await createSentry().poll({ settings: TRAMLO_SENTRY, cursor: from, fetch: fake.fetch, now });

    return [result, ...(await pollFrom(result.cursor, index + 1))];
  };

  return { results: await pollFrom(cursor, 0), sent: fake.sent };
}

/**
 * Returns the search query a request sent to Sentry.
 * @example
 * queryOf(sent[0]); // 'is:unresolved lastSeen:-70m'
 */
export function queryOf(request: SentRequest | undefined): string | null {
  return new URL(request?.url ?? 'https://sentry.io').searchParams.get('query');
}

/**
 * Returns the ids every poll of a run played, each once, as the platform plays them.
 * @example
 * playedIds(results); // ['77-new', '77-recurring-2026-10-04T15']
 */
export function playedIds(results: readonly PollResult[]): string[] {
  return [...new Set(results.flatMap((result) => result.events.map((event) => event.id)))];
}
