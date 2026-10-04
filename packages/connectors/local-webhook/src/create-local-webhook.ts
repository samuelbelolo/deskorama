import type { Clock, SourceEvent } from '@deskorama/core';
import { createServer, type Server } from 'node:http';
import { createRequestListener } from './create-request-listener.ts';
import { IPV4_LOOPBACK, IPV6_LOOPBACK } from './loopback-addresses.ts';

/** The shortest shared secret accepted, so a guessable one cannot be configured by mistake. */
const MIN_SECRET_LENGTH = 16;

/** How a Local webhook is set up. */
export interface LocalWebhookOptions {
  /** The port to listen on; 0 picks a free one, reported by `start`. */
  readonly port: number;
  /** The shared secret every request carries as `Authorization: Bearer <secret>`. */
  readonly secret: string;
  /** Stamps Events posted without a time and numbers generated ids. */
  readonly clock: Clock;
  /** Receives every accepted Event. */
  readonly onEvent: (event: SourceEvent) => void;
}

/** A Local webhook, listening between `start` and `stop`. */
export interface LocalWebhook {
  /** Listens on the loopback interface and resolves with the port. */
  start(): Promise<number>;
  /** Stops listening. */
  stop(): Promise<void>;
}

/**
 * Returns the Local webhook Connector: an HTTP listener on 127.0.0.1 and ::1 only, never the network, that accepts
 * one Event per `POST /events` carrying the shared secret, validates it and hands it to `onEvent`.
 * @example
 * const webhook = createLocalWebhook({ port: 4519, secret, clock, onEvent: (event) => engine.send(event) });
 * await webhook.start(); // 4519
 * // curl http://127.0.0.1:4519/events -H "Authorization: Bearer $SECRET" -H "Content-Type: application/json" -d @event.json
 */
export function createLocalWebhook(options: LocalWebhookOptions): LocalWebhook {
  if (options.secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`The Local webhook secret needs at least ${MIN_SECRET_LENGTH} characters.`);
  }
  let port = options.port;
  const servers: Server[] = [];
  const listener = createRequestListener({ ...options, port: () => port });
  const stop = async (): Promise<void> => {
    await Promise.all(servers.map((server) => new Promise((resolve) => server.close(resolve))));
    servers.length = 0;
  };
  const bind = async (address: string, optional: boolean): Promise<void> => {
    const server = createServer(listener);
    const bound = await listen(server, address, port, optional);
    if (bound === null) return;
    port = bound;
    servers.push(server);
  };
  return {
    async start() {
      try {
        // IPv4 first: it picks the port when 0 was asked, and IPv6 listens on the same one.
        await bind(IPV4_LOOPBACK, false);
        await bind(IPV6_LOOPBACK, true);
      } catch (error) {
        // The port is taken on one address: listen on none rather than half the loopback interface.
        await stop();
        throw error;
      }
      return port;
    },
    stop,
  };
}

/**
 * Listens on one address and resolves with the bound port, or with null when that address does not exist on this
 * Mac (IPv6 turned off) and `optional` is true.
 * @example
 * await listen(createServer(listener), '::1', 4519, true); // 4519, or null without IPv6
 */
function listen(server: Server, host: string, port: number, optional: boolean): Promise<number | null> {
  return new Promise((resolve, reject) => {
    server.once('error', (error: NodeJS.ErrnoException) => {
      const missing = error.code === 'EADDRNOTAVAIL' || error.code === 'EAFNOSUPPORT';
      if (optional && missing) resolve(null);
      else reject(error);
    });
    server.listen({ host, port, ipv6Only: host.includes(':') }, () => {
      const address = server.address();
      resolve(typeof address === 'object' && address !== null ? address.port : port);
    });
  });
}
