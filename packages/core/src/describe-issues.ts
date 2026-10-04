import type { StandardIssue } from './standard-schema.ts';

/**
 * Returns one readable line per validation issue: the dotted path of the value, then the message.
 * @example
 * describeIssues([{ message: 'Invalid type', path: ['events', { key: 0 }, 'kind'] }]);
 * // ['events.0.kind: Invalid type']
 * describeIssues([{ message: 'Invalid type' }]); // ['Invalid type']
 */
export function describeIssues(issues: readonly StandardIssue[]): string[] {
  return issues.map((issue) => {
    const path = issue.path ?? [];

    if (path.length === 0) return issue.message;

    const keys = path.map((segment) => String(typeof segment === 'object' ? segment.key : segment));

    return `${keys.join('.')}: ${issue.message}`;
  });
}
