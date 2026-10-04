import type { Cancel, Clock } from '@deskorama/core';
import { fetchLatestRelease, type Fetch, type LatestRelease } from './fetch-latest-release.ts';
import { isNewerVersion } from './is-newer-version.ts';
import { writeLog } from './write-log.ts';

/** How often the app asks GitHub for a new release: hourly, far under the 60 unauthenticated requests per hour. */
const CHECK_EVERY_MS = 60 * 60 * 1000;

/** What the release watch needs to know. */
export interface ReleaseWatchOptions {
  /** `owner/repo` of the GitHub repository, set at build time; empty for a local build, which turns the watch off. */
  readonly repository: string;
  /** The running app's version. */
  readonly version: string;
  readonly clock: Clock;
  readonly fetch: Fetch;
  /** Called once per release newer than the running app. */
  readonly onNewRelease: (release: LatestRelease) => void;
}

/**
 * Checks GitHub Releases at launch and every hour, and reports each release newer than the running app. The app is
 * not signed by Apple, so it cannot update itself: the menu bar offers the release's page instead.
 * Returns what stops the watch.
 * @example
 * const stop = watchReleases({ repository: 'samuelbelolo/deskorama', version: app.getVersion(), clock,
 *   fetch: net.fetch, onNewRelease: (release) => tray.update({ newRelease: release }) });
 */
export function watchReleases(options: ReleaseWatchOptions): () => void {
  if (options.repository === '') {
    writeLog('releases', 'off: a local build has no repository to watch');
    return () => {};
  }
  let reported = options.version;
  let cancel: Cancel | undefined;
  const check = async (): Promise<void> => {
    const release = await fetchLatestRelease(options.fetch, options.repository);
    if (release !== null && isNewerVersion(release.tag, reported)) {
      reported = release.tag;
      options.onNewRelease(release);
    }
  };
  const schedule = (delay: number): void => {
    cancel = options.clock.after(delay, () => {
      void check().finally(() => schedule(CHECK_EVERY_MS));
    });
  };
  schedule(0);
  return () => cancel?.();
}
