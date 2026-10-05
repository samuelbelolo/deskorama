import type { Connector } from '@deskorama/core';

/**
 * Returns the address of the page where a Connector's token is created, or null when it has none. A Connector whose
 * service runs at several addresses (a region of its cloud) names the field that holds the person's own: the page
 * is then opened there, at the Connector's path, provided the field holds an `https://` address. Only the
 * Connector decides the path, so the settings page can never make the app open an address of its choosing.
 * @example
 * tokenPageUrl(createLinear(), {}); // 'https://linear.app/settings/account/security'
 * tokenPageUrl(createPostHog(), { host: 'https://eu.posthog.com' }); // 'https://eu.posthog.com/settings/user-api-keys'
 */
export function tokenPageUrl(connector: Connector, values: Readonly<Record<string, string>>): string | null {
  const page = connector.about.token.page;

  if (page === null) return null;

  if (page.originField === undefined) return page.url;

  const typed = originOf(values[page.originField] ?? '');

  if (typed === null) return page.url;

  const { pathname, search } = new URL(page.url);

  return `${typed}${pathname}${search}`;
}

/**
 * Returns the origin of an `https://` address, or null for anything else.
 * @example
 * originOf(' https://eu.posthog.com/project/1 '); // 'https://eu.posthog.com'
 * originOf('eu.posthog.com'); // null
 */
function originOf(value: string): string | null {
  try {
    const url = new URL(value.trim());

    return url.protocol === 'https:' && url.hostname !== '' ? url.origin : null;
  } catch {
    return null;
  }
}
