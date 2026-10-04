import type { ConnectorResponse } from '@deskorama/core';

/** An HTTP response as recorded from a service: its status, headers and body, JSON or text. */
export interface RecordedResponse {
  readonly status: number;
  readonly headers?: Readonly<Record<string, string>>;
  /** Sent as JSON unless it is a string. */
  readonly body?: unknown;
}

/**
 * Returns the response a Connector reads for a recording: header names are matched without regard to case, as
 * `fetch` does.
 * @example
 * const response = replayResponse({ status: 304, headers: { ETag: '"p2"' } });
 * response.headers.get('etag'); // '"p2"'
 */
export function replayResponse(recorded: RecordedResponse): ConnectorResponse {
  const headers = new Map(Object.entries(recorded.headers ?? {}).map(([name, value]) => [name.toLowerCase(), value]));

  const body = typeof recorded.body === 'string' ? recorded.body : JSON.stringify(recorded.body ?? null);

  return {
    status: recorded.status,
    headers: { get: (name) => headers.get(name.toLowerCase()) ?? null },
    text: async () => body,
  };
}
