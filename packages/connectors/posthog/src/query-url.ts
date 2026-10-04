/**
 * Returns the address of a project's query API on a PostHog cloud, or null when the cloud's address is not a
 * well-formed `https://` one, so the key never travels in clear, or the project's id is not a number.
 * @example
 * queryUrl('https://eu.posthog.com', '12345'); // "https://eu.posthog.com/api/projects/12345/query/"
 * queryUrl('http://eu.posthog.com', '12345'); // null
 * queryUrl('https://eu.posthog.com', 'kavelo'); // null
 */
export function queryUrl(host: string, project: string): string | null {
  if (!/^\d+$/u.test(project)) return null;

  try {
    const url = new URL(host);

    if (url.protocol !== 'https:' || url.hostname === '') return null;

    return new URL(`/api/projects/${project}/query/`, url.origin).href;
  } catch {
    return null;
  }
}
