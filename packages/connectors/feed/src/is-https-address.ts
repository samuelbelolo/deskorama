/**
 * Returns true for a well-formed `https://` address with a host, so the token never travels in clear.
 * @example
 * isHttpsAddress('https://api.tramlo.example/events'); // true
 * isHttpsAddress('http://api.tramlo.example/events'); // false
 * isHttpsAddress('not an address'); // false
 */
export function isHttpsAddress(address: string): boolean {
  try {
    const url = new URL(address);

    return url.protocol === 'https:' && url.hostname !== '';
  } catch {
    return false;
  }
}
