import * as v from 'valibot';

/** The newest published release of the app's repository. */
export interface LatestRelease {
  /** The release's tag, e.g. "v0.3.0". */
  readonly tag: string;
  /** Its page on GitHub, where the dmg is downloaded. */
  readonly url: string;
}

/** The part of `fetch` the check uses: Electron's `net.fetch`, or a test's fake GitHub. */
export type Fetch = (url: string, init: RequestInit) => Promise<Response>;

/** The two fields read from GitHub's answer; the rest is ignored. */
const RELEASE = v.object({ tag_name: v.string(), html_url: v.string() });

/**
 * Asks GitHub for the newest published release of `repository` (drafts and pre-releases are never returned), or
 * null when there is none or GitHub cannot be reached. The page address is only trusted when it belongs to the
 * repository's releases, since the menu bar opens it in the browser. Takes `fetch` so tests answer for GitHub.
 * @example
 * await fetchLatestRelease(net.fetch, 'samuelbelolo/deskorama');
 * // { tag: 'v0.3.0', url: 'https://github.com/samuelbelolo/deskorama/releases/tag/v0.3.0' }
 */
export async function fetchLatestRelease(fetch: Fetch, repository: string): Promise<LatestRelease | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) return null;
    const parsed = v.safeParse(RELEASE, await response.json());
    if (!parsed.success) return null;
    const { tag_name: tag, html_url: url } = parsed.output;
    return url.startsWith(`https://github.com/${repository}/releases/`) ? { tag, url } : null;
  } catch {
    return null;
  }
}
