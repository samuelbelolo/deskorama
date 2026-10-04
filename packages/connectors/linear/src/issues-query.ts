/** How many issues a page holds: a busy morning is read page after page. */
const PAGE_SIZE = 50;

/**
 * The GraphQL query of the issues updated after a time, by update time, with only the fields the Connector reads:
 * no assignee, no creator, no description.
 */
export const ISSUES_QUERY: string = `query RecentIssues($filter: IssueFilter, $after: String) {
  issues(filter: $filter, orderBy: updatedAt, first: ${PAGE_SIZE}, after: $after) {
    nodes { id identifier title createdAt updatedAt completedAt state { type } }
    pageInfo { hasNextPage endCursor }
  }
}`;
