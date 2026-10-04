import type { ConnectorResponse } from '../src/connector-fetch.ts';

/**
 * Returns a response with a status, headers and a text body, as a service would answer a Connector.
 * @example
 * httpResponse(429, { 'retry-after': '30' }).headers.get('Retry-After'); // "30"
 */
export function httpResponse(status: number, headers: Record<string, string> = {}, body = ''): ConnectorResponse {
  const lower = new Map(Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value]));

  return {
    status,
    headers: { get: (name) => lower.get(name.toLowerCase()) ?? null },
    text: async () => body,
  };
}
