import type { ConnectorFetch, ConnectorRequest } from '@deskorama/core';
import { replayResponse, type RecordedResponse } from './recorded-response.ts';

/** One request a Connector sent to the fake `fetch`. */
export interface SentRequest {
  readonly url: string;
  readonly init: ConnectorRequest;
}

/** Answers one request with a recording, or throws to play a request that never gets an answer. */
export type Responder = (request: SentRequest) => RecordedResponse;

/** A `fetch` that answers from recordings, with the requests it received. */
export interface FakeFetch {
  readonly fetch: ConnectorFetch;
  /** Every request received, oldest first. */
  readonly sent: readonly SentRequest[];
}

/**
 * Returns a `fetch` that never touches the network: `respond` picks the recording for each request, from a list
 * played in order or from the request itself.
 * @example
 * const fake = createFakeFetch(inOrder([{ status: 200, body: page }, { status: 304 }]));
 * await connector.poll({ settings, cursor: null, fetch: fake.fetch, now });
 * fake.sent[0]?.init.headers['Authorization']; // "Bearer …"
 */
export function createFakeFetch(respond: Responder): FakeFetch {
  const sent: SentRequest[] = [];

  const fetch: ConnectorFetch = async (url, init) => {
    const request = { url, init };

    sent.push(request);

    return replayResponse(respond(request));
  };

  return { fetch, sent };
}
