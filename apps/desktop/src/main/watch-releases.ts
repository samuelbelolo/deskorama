import type { Cancel, Clock } from '@deskorama/core';
import { fetchLatestRelease, type Fetch, type LatestRelease, type ReleaseAnswer } from './fetch-latest-release.ts';
import { isNewerVersion } from './is-newer-version.ts';
import { writeLog } from './write-log.ts';

/** How often the app asks GitHub for a new release: hourly, far under the 60 unauthenticated requests per hour. */
const CHECK_EVERY_MS = 60 * 60 * 1000;

/**
 * How long an answer from GitHub is reused. GitHub serves the same answer for a minute (`max-age=60`), and every
 * request spends the hourly allowance, an unauthenticated `304 Not Modified` included (measured on 6 October 2026):
 * asking again sooner would cost a request and learn nothing.
 */
const SAME_ANSWER_MS = 60 * 1000;

/** How long GitHub may take to answer before the check gives up, so the menu never waits on a stalled connection. */
const ANSWER_WITHIN_MS = 10 * 1000;

/** What a check learnt: a release newer than the running app is known, GitHub has none, or GitHub did not answer. */
export type CheckOutcome = 'newer' | 'none' | 'unreachable';

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

/** The release watch as the menu bar drives it. */
export interface ReleaseWatch {
  /** False in a local build, which has no repository to watch. */
  readonly on: boolean;
  /**
   * Asks GitHub now, without waiting for the next hour, and reports a newer release like any other check. A check
   * already on its way is joined, and an answer less than a minute old is reused; a check that got no answer is
   * never reused.
   */
  check(): Promise<CheckOutcome>;
  stop(): void;
}

/**
 * Checks GitHub Releases at launch and every hour, and whenever asked to, and reports each release newer than the
 * running app. The app is not signed by Apple, so it cannot update itself: the menu bar downloads the release's dmg
 * instead, or opens its page.
 * @example
 * const releases = watchReleases({ repository: 'samuelbelolo/deskorama', version: app.getVersion(), clock,
 *   fetch: net.fetch, onNewRelease: (release) => tray.update({ newRelease: release }) });
 * await releases.check(); // 'newer' once a newer release is published
 */
export function watchReleases(options: ReleaseWatchOptions): ReleaseWatch {
  if (options.repository === '') {
    writeLog('releases', 'off: a local build has no repository to watch');

    return { on: false, check: async () => 'none', stop: () => {} };
  }

  const { clock } = options;

  let reported = options.version;
  let answeredAt: number | null = null;
  let pending: Promise<CheckOutcome> | null = null;
  let cancel: Cancel | undefined;
  let stopped = false;

  /** Returns what is known after a check that did, or did not, reach GitHub. */
  const outcome = (reached: boolean): CheckOutcome => {
    if (reported !== options.version) return 'newer';

    return reached ? 'none' : 'unreachable';
  };

  /** Asks GitHub once, giving up after ten seconds, and reports a release newer than the last one reported. */
  const ask = async (): Promise<CheckOutcome> => {
    const answer = await new Promise<ReleaseAnswer>((resolve) => {
      const stopWaiting = clock.after(ANSWER_WITHIN_MS, () => resolve('unreachable'));

      void fetchLatestRelease(options.fetch, options.repository).then((heard) => {
        stopWaiting();
        resolve(heard);
      });
    });

    if (answer === 'unreachable' || stopped) return outcome(false);

    answeredAt = clock.now();

    if (answer !== 'none' && isNewerVersion(answer.tag, reported)) {
      reported = answer.tag;
      options.onNewRelease(answer);
    }

    return outcome(true);
  };

  /** Joins the check on its way, reuses an answer under a minute old, or asks GitHub. */
  const check = (): Promise<CheckOutcome> => {
    if (pending !== null) return pending;

    if (answeredAt !== null && clock.now() - answeredAt < SAME_ANSWER_MS) return Promise.resolve(outcome(true));

    pending = ask().finally(() => (pending = null));

    return pending;
  };

  /** Checks after `delay`, then every hour until the watch is stopped. */
  const schedule = (delay: number): void => {
    cancel = clock.after(delay, () => {
      void check().finally(() => {
        if (!stopped) schedule(CHECK_EVERY_MS);
      });
    });
  };

  schedule(0);

  return {
    on: true,
    check,
    stop() {
      stopped = true;
      cancel?.();
    },
  };
}
