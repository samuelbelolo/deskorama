// The repository permissions a fine-grained token needs, named the way GitHub's token settings name them, so an
// error can say which one to grant. Each is read-only.

/** Reading the repository itself: its default branch, its stars and its open issues. */
export const METADATA_PERMISSION = 'Metadata: read';

/** Reading commits and releases. */
export const CONTENTS_PERMISSION = 'Contents: read';

/** Reading pull requests and their reviews. */
export const PULL_REQUESTS_PERMISSION = 'Pull requests: read';

/** Reading issues. */
export const ISSUES_PERMISSION = 'Issues: read';

/** Reading workflow runs. */
export const ACTIONS_PERMISSION = 'Actions: read';

/** Reading deployments and their statuses. */
export const DEPLOYMENTS_PERMISSION = 'Deployments: read';
