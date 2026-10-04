/** The IPv4 loopback address: the Local webhook listens here first, and picks its port here when asked for 0. */
export const IPV4_LOOPBACK = '127.0.0.1';

/** The IPv6 loopback address, on the same port. A Mac with IPv6 turned off has none. */
export const IPV6_LOOPBACK = '::1';

/** The host names a local script may use to reach the Local webhook; never a network address. */
export const LOOPBACK_HOST_NAMES: readonly string[] = ['127.0.0.1', '[::1]', 'localhost'];
