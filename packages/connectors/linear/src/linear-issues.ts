/** One issue of the workspace, once validated: the fields the Connector asks for. */
export interface LinearIssue {
  readonly id: string;
  /** The team's key and the issue's number, e.g. "ENG-142". */
  readonly identifier: string;
  readonly title: string;
  /** ISO 8601 times. */
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedAt: string | null;
  readonly state: {
    /** The kind of workflow state: triage, backlog, unstarted, started, completed, canceled or duplicate. */
    readonly type: string;
  };
}

/** One page of the issues updated after the cursor. */
export interface LinearIssuePage {
  readonly nodes: readonly LinearIssue[];
  readonly pageInfo: {
    readonly hasNextPage: boolean;
    /** Where the next page starts; null on an empty page. */
    readonly endCursor: string | null;
  };
}
