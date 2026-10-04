/**
 * Returns the address to poll: the Feed's own address with its `cursor` query parameter set to the cursor, or
 * removed for the first poll. Any other parameter and a `#fragment` are kept where they belong.
 * @example
 * feedUrl('https://api.tramlo.example/deskorama/events', 'c_1042');
 * // "https://api.tramlo.example/deskorama/events?cursor=c_1042"
 * feedUrl('https://api.tramlo.example/events?team=web#top', null); // "https://api.tramlo.example/events?team=web#top"
 */
export function feedUrl(address: string, cursor: string | null): string {
  const url = new URL(address);

  if (cursor === null) url.searchParams.delete('cursor');
  else url.searchParams.set('cursor', cursor);

  return url.href;
}
