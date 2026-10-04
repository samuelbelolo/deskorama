/**
 * Returns the number of the last page a GitHub `Link` header points to, or null when there is a single page.
 * @example
 * lastPage('<https://api.github.com/…&page=2>; rel="next", <https://api.github.com/…&page=7>; rel="last"'); // 7
 * lastPage(null); // null
 */
export function lastPage(link: string | null): number | null {
  const last = link?.split(',').find((part) => part.includes('rel="last"'));

  const page = last?.match(/[?&]page=(\d+)/)?.[1];

  return page === undefined ? null : Number(page);
}
