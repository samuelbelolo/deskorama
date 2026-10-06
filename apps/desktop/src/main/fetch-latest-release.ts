import * as v from 'valibot';

/** The newest published release of the app's repository. */
export interface LatestRelease {
  /** The release's tag, e.g. "v0.3.0". */
  readonly tag: string;
  /** What the menu bar opens: the dmg built for this Mac's processor, or the release's page when it has none. */
  readonly url: string;
}

/** The part of `fetch` the check uses: Electron's `net.fetch`, or a test's fake GitHub. */
export type Fetch = (url: string, init: RequestInit) => Promise<Response>;

/** The fields read from GitHub's answer; the rest is ignored. A release without files has no `assets`. */
const RELEASE = v.object({
  tag_name: v.string(),
  html_url: v.string(),
  assets: v.optional(v.array(v.object({ name: v.string(), browser_download_url: v.string() })), []),
});

/** What GitHub said: its newest published release, that it has none, or nothing that could be read. */
export type ReleaseAnswer = LatestRelease | 'none' | 'unreachable';

/**
 * Asks GitHub for the newest published release of `repository` (drafts and pre-releases are never returned):
 * the release, `'none'` when the repository has published none, or `'unreachable'` when GitHub could not be
 * reached, refused (a rate limit) or answered something else. The release's address is its dmg built for `arch`
 * (the running Mac's processor), or its page when no dmg was built for that processor. An address
 * is only trusted when it belongs to the repository's releases, since the menu bar opens it in the browser: a release
 * whose page is elsewhere counts as none. Takes `fetch` so tests answer for GitHub.
 * @example
 * await fetchLatestRelease(net.fetch, 'samuelbelolo/deskorama');
 * // { tag: 'v0.3.0', url: 'https://github.com/samuelbelolo/deskorama/releases/download/v0.3.0/Deskorama-0.3.0-mac-arm64.dmg' }
 */
export async function fetchLatestRelease(
  fetch: Fetch,
  repository: string,
  arch: string = process.arch,
): Promise<ReleaseAnswer> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (response.status === 404) return 'none';
    if (!response.ok) return 'unreachable';

    const parsed = v.safeParse(RELEASE, await response.json());

    if (!parsed.success) return 'unreachable';

    const { tag_name: tag, html_url: page, assets } = parsed.output;
    const releases = `https://github.com/${repository}/releases/`;

    if (!page.startsWith(releases)) return 'none';

    const dmg = assets.find((asset) => asset.name.endsWith(`-mac-${arch}.dmg`))?.browser_download_url;

    return { tag, url: dmg?.startsWith(releases) ? dmg : page };
  } catch {
    return 'unreachable';
  }
}
