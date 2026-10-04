/** What a Connector sends: a method, headers and, rarely, a body. A `RequestInit` of the platform's `fetch`. */
export interface ConnectorRequest {
  readonly method?: 'GET' | 'POST';
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: string;
}

/** The part of a `Response` a Connector reads, so a test answers with a few fields instead of a whole `Response`. */
export interface ConnectorResponse {
  readonly status: number;
  readonly headers: { get(name: string): string | null };
  text(): Promise<string>;
}

/**
 * The `fetch` a Connector receives instead of reaching the network itself: the platform's own in the app, a fake
 * one that replays recorded responses in tests.
 */
export type ConnectorFetch = (url: string, init: ConnectorRequest) => Promise<ConnectorResponse>;
