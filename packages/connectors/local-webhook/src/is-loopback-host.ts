import { LOOPBACK_HOST_NAMES } from './loopback-addresses.ts';

/**
 * Returns true when a request's `Host` header names the loopback interface on `port`. A web page that rebinds its
 * own domain to 127.0.0.1 still sends its domain here, so this refuses it before the secret is even checked.
 * @example
 * isLoopbackHost('127.0.0.1:4519', 4519); // true
 * isLoopbackHost('tramlo.example:4519', 4519); // false
 */
export function isLoopbackHost(host: string | undefined, port: number): boolean {
  return host !== undefined && LOOPBACK_HOST_NAMES.some((name) => host.toLowerCase() === `${name}:${port}`);
}
