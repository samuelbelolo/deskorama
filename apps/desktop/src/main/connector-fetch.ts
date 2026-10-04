import type { ConnectorFetch } from '@deskorama/core';
import { net } from 'electron';

/** How long a Connector's request may take before it counts as a network failure. */
const TIMEOUT_MS = 30_000;

/**
 * The `fetch` Connectors receive: Chromium's network stack (the system proxy and certificates apply), no cookies,
 * no HTTP cache (a Connector sends its own `If-None-Match`), and a 30-second timeout.
 * @example
 * await connectorFetch('https://api.tramlo.example/events', { headers: { Authorization: `Bearer ${token}` } });
 */
export const connectorFetch: ConnectorFetch = (url, init) =>
  net.fetch(url, { ...init, cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(TIMEOUT_MS) });
