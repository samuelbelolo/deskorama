import type { Responder } from './create-fake-fetch.ts';
import type { RecordedResponse } from './recorded-response.ts';

/**
 * Returns a responder that plays `recordings` one per request, in order, and throws past the last one.
 * @example
 * createFakeFetch(inOrder([{ status: 200, body: page }, { status: 304 }]));
 */
export function inOrder(recordings: readonly RecordedResponse[]): Responder {
  let next = 0;

  return (request) => {
    const recording = recordings[next++];

    if (recording === undefined) throw new Error(`No recording left for ${request.url}`);

    return recording;
  };
}
