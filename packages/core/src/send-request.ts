import { ConnectorError } from './connector-error.ts';
import type { ConnectorFetch, ConnectorRequest, ConnectorResponse } from './connector-fetch.ts';

/**
 * Sends a request through the injected `fetch` and returns its response, whatever its status. A request that never
 * gets an answer (no network, DNS, TLS, a timeout) throws a `network` {@link ConnectorError} instead.
 * @example
 * const response = await sendRequest(fetch, 'https://feed.tramlo.example/events', { headers });
 * response.status; // 200
 */
export async function sendRequest(
  fetch: ConnectorFetch,
  url: string,
  init: ConnectorRequest,
): Promise<ConnectorResponse> {
  try {
    return await fetch(url, init);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const host = url.split('/')[2] ?? url;

    throw new ConnectorError({ kind: 'network' }, `No answer from ${host}: ${reason}`);
  }
}
