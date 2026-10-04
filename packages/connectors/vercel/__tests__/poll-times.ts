import type { PollResult } from '@deskorama/core';
import { createFakeFetch, FIXTURE_TIME, inOrder, type RecordedResponse, type SentRequest } from '@deskorama/test-utils';
import { createVercel } from '../src/create-vercel.ts';
import { TRAMLO_VERCEL } from './tramlo-vercel.ts';

/** One minute, the usual time between two polls. */
export const MINUTE = 60_000;

/** What a run of polls gave, and the requests they sent. */
export interface PolledTimes {
  readonly results: PollResult[];
  readonly sent: readonly SentRequest[];
}

/**
 * Polls Tramlo's Vercel project `times` times in a row, a minute apart from `start`, each poll resuming from the cursor
 * the previous one returned, through a fake `fetch` answering `recordings` in order.
 * @example
 * const { results, sent } = await pollTimes([recorded('deployments-last-hour.json')], 1);
 * results[0]?.events.length; // 3
 */
export async function pollTimes(
  recordings: readonly RecordedResponse[],
  times: number,
  cursor: string | null = null,
  start: number = FIXTURE_TIME,
): Promise<PolledTimes> {
  const fake = createFakeFetch(inOrder(recordings));

  /**
   * Returns the results of the polls from `poll` to `times`, each resuming from the cursor of the one before.
   * @example
   * await pollFrom(null, 0); // [first, second, …]
   */
  const pollFrom = async (from: string | null, poll: number): Promise<PollResult[]> => {
    if (poll === times) return [];

    const now = start + poll * MINUTE;

    const result = await createVercel().poll({ settings: TRAMLO_VERCEL, cursor: from, fetch: fake.fetch, now });

    return [result, ...(await pollFrom(result.cursor, poll + 1))];
  };

  return { results: await pollFrom(cursor, 0), sent: fake.sent };
}
