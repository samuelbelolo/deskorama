/**
 * Returns whether a GitHub `Link` header points to a next page.
 * @example
 * hasNextPage('<https://api.github.com/…&page=2>; rel="next", <https://api.github.com/…&page=7>; rel="last"'); // true
 * hasNextPage(null); // false
 */
export function hasNextPage(link: string | null): boolean {
  return link?.split(',').some((part) => part.includes('rel="next"')) ?? false;
}
