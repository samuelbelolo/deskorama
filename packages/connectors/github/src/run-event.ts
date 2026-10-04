import type { SourceEvent } from '@deskorama/core';
import { eventText } from './event-text.ts';
import { githubEvent } from './github-event.ts';
import type { Run } from './run-schema.ts';
import type { Scan } from './scan.ts';

/** How a finished run can go red. */
const FAILED = new Set(['failure', 'timed_out', 'startup_failure']);

/**
 * Returns the Event of a workflow run attempt that finished red, with the workflow and, on the default branch, its
 * name: another branch's name can carry a person's, so it stays "a branch". A run still going, or one that
 * succeeded, was cancelled or skipped, is no Event. The caller decides whether it is new.
 * @example
 * runFailedEvent({ id: 5101, run_attempt: 1, name: 'CI', head_branch: 'main', conclusion: 'failure', … }, 'main', scan);
 * // { id: 'run-5101-1-failed', kind: 'ci.failed', archetype: 'error', text: { en: { detail: 'CI on main', tag: 'CI' } } }
 */
export function runFailedEvent(run: Run, branch: string, scan: Scan): SourceEvent | null {
  if (run.status !== 'completed' || run.conclusion === null || !FAILED.has(run.conclusion)) return null;

  const workflow = run.name ?? 'Workflow';

  const where =
    run.head_branch === branch
      ? { fr: `sur ${branch}`, en: `on ${branch}` }
      : { fr: 'sur une branche', en: 'on a branch' };

  return githubEvent(scan.source, {
    id: `run-${run.id}-${run.run_attempt}-failed`,
    kind: 'ci.failed',
    archetype: 'error',
    rarity: 'common',
    at: run.updated_at,
    text: eventText(
      { fr: 'CI en échec', en: 'CI failed' },
      { fr: `${workflow} ${where.fr}`, en: `${workflow} ${where.en}` },
      'CI',
    ),
  });
}
