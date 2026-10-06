import type { ReleaseCheck } from './tray-menu.ts';
import type { ReleaseWatch } from './watch-releases.ts';

/**
 * Asks the release watch to check now and shows where the check stands on the way: asking, then ready again when a
 * newer release is known (its download takes the line's place), or what stopped it: GitHub has none, or did not
 * answer.
 * @example
 * await checkForRelease(releases, (releaseCheck) => tray.update({ releaseCheck }));
 * // shows 'checking', then 'none' when the app is up to date
 */
export async function checkForRelease(
  releases: Pick<ReleaseWatch, 'check'>,
  show: (state: ReleaseCheck) => void,
): Promise<void> {
  show('checking');

  const outcome = await releases.check();

  show(outcome === 'newer' ? 'ready' : outcome);
}
