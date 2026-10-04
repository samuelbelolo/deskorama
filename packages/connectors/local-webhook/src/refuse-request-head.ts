import { isLoopbackHost } from './is-loopback-host.ts';
import { isSameSecret } from './is-same-secret.ts';

/** The path Events are posted to. */
export const EVENTS_PATH = '/events';

/** The largest body accepted, in bytes: an Event is a few hundred bytes. */
export const MAX_BODY_BYTES: number = 64 * 1024;

/** What the Local webhook reads from a request before its body. */
export interface RequestHead {
  readonly method: string | undefined;
  readonly path: string | undefined;
  readonly host: string | undefined;
  readonly authorization: string | undefined;
  readonly contentType: string | undefined;
  readonly contentLength: string | undefined;
}

/** Why a request is turned away, as an HTTP status and a one-line reason. */
export interface Refusal {
  readonly status: number;
  readonly error: string;
}

/**
 * Returns why a request is refused before its body is read, or null when its head is acceptable. The checks run
 * from the cheapest and least revealing: a foreign `Host` and a wrong secret learn nothing about the rest.
 * @example
 * refuseRequestHead({ method: 'POST', path: '/events', host: '127.0.0.1:4519', authorization: 'Bearer nope',
 *   contentType: 'application/json', contentLength: '120' }, 4519, 'the-real-secret-1234'); // { status: 401, … }
 */
export function refuseRequestHead(head: RequestHead, port: number, secret: string): Refusal | null {
  if (!isLoopbackHost(head.host, port))
    return { status: 403, error: 'Only requests to the loopback address are accepted.' };
  if (head.path !== EVENTS_PATH) return { status: 404, error: `Events are posted to ${EVENTS_PATH}.` };
  if (head.method !== 'POST') return { status: 405, error: 'Events are sent with POST.' };
  const given = head.authorization?.startsWith('Bearer ') === true ? head.authorization.slice('Bearer '.length) : '';
  if (!isSameSecret(given, secret))
    return { status: 401, error: 'Send the shared secret as "Authorization: Bearer <secret>".' };
  if (head.contentType?.split(';')[0]?.trim().toLowerCase() !== 'application/json') {
    return { status: 415, error: 'Send the Event as "Content-Type: application/json".' };
  }
  if (Number(head.contentLength ?? 0) > MAX_BODY_BYTES) return { status: 413, error: 'The body is too large.' };
  return null;
}
