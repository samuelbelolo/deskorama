import { ConnectorError } from './connector-error.ts';
import type { ConnectorResponse } from './connector-fetch.ts';

/**
 * Returns the parsed JSON body of a response, or throws an `invalid-response` {@link ConnectorError} when it is not
 * JSON. A body that stops halfway is a network failure.
 * @example
 * await readJson(response, 'The Feed page'); // { events: [], next_cursor: null, has_more: false }
 */
export async function readJson(response: ConnectorResponse, what: string): Promise<unknown> {
  let body: string;

  try {
    body = await response.text();
  } catch {
    throw new ConnectorError({ kind: 'network' }, `${what} was cut off.`);
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new ConnectorError({ kind: 'invalid-response' }, `${what} is not JSON.`);
  }
}
