import { EVENTS_PATH } from '@deskorama/connector-local-webhook';

/**
 * Returns the address scripts post Events to, on the loopback interface.
 * @example
 * webhookAddress(47213); // 'http://127.0.0.1:47213/events'
 */
export function webhookAddress(port: number): string {
  return `http://127.0.0.1:${port}${EVENTS_PATH}`;
}
