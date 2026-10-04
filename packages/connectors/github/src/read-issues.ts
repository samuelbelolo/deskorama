import type { GithubSession } from './create-github-session.ts';
import type { Found } from './found.ts';
import { ISSUES_PERMISSION } from './github-permissions.ts';
import { issueEvent } from './issue-event.ts';
import { ISSUES_SCHEMA } from './issue-schema.ts';
import { readRecentPages } from './read-recent-pages.ts';
import type { Scan } from './scan.ts';

/** The issues opened last, whatever their state. */
const PATH = '/issues?state=all&sort=created&direction=desc&per_page=30';

/**
 * Reads the issues opened since `scan.since` and returns their Events; a pull request, which GitHub lists among
 * issues too, is left to the pull requests.
 * @example
 * await readIssues(session, scan); // { events: [{ kind: 'issue.opened', … }], activity: [{ id: 5003, at }] }
 */
export async function readIssues(session: GithubSession, scan: Scan): Promise<Found> {
  const issues = await readRecentPages(session, {
    path: PATH,
    permission: ISSUES_PERMISSION,
    schema: ISSUES_SCHEMA,
    what: 'The issues',
    isNew: (issue) => issue.created_at > scan.since,
  });

  if (issues === null) return { events: [], activity: [] };

  const opened = issues.filter((issue) => !issue.is_pull);

  return {
    events: opened.flatMap((issue) => issueEvent(issue, scan) ?? []),
    activity: opened.flatMap((issue) => (issue.user === null ? [] : [{ id: issue.user.id, at: issue.created_at }])),
  };
}
