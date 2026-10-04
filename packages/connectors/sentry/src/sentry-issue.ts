/**
 * One issue of the organization, once validated: the fields the Connector reads. Its title, message and assignee
 * are never read, since they may hold personal data.
 */
export interface SentryIssue {
  readonly id: string;
  /** The issue's short name, e.g. "TRAMLO-WEB-3F". */
  readonly shortId: string;
  /** When its very first event happened, in ISO 8601, over its whole life rather than the period searched. */
  readonly firstSeen: string;
  /** When its latest event happened, in ISO 8601. */
  readonly lastSeen: string;
  /** How many events it has had in its whole life, as a string of digits. */
  readonly count: string;
  /** The exception's type, e.g. "TypeError"; empty for a message. */
  readonly type: string;
}
