/**
 * Returns Sentry's cursor for the next page from the `Link` header of an answer, or null when no more results wait.
 * @example
 * nextPage('<https://sentry.io/…>; rel="next"; results="true"; cursor="0:100:0"'); // '0:100:0'
 * nextPage('<https://sentry.io/…>; rel="next"; results="false"; cursor="0:200:0"'); // null
 */
export function nextPage(link: string | null): string | null {
  const next = /rel="next";\s*results="true";\s*cursor="([^"]+)"/u.exec(link ?? '');

  return next?.[1] ?? null;
}
