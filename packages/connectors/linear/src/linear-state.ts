/**
 * What the Linear Connector resumes from, kept inside the opaque cursor the platform persists. `since` stays put
 * while the pages of one catch-up are read, whatever order Linear returns them in, then moves to the newest update.
 */
export interface LinearState {
  /** Read the issues updated after this ISO 8601 time. */
  readonly since: string;
  /**
   * Tell what happened after this ISO 8601 time. It trails `since` by one catch-up: an issue edited while the pages
   * of a catch-up were read slips past them, and the next catch-up still tells its creation or completion.
   */
  readonly from: string;
  /** Where the next page starts while catching up; null for a first page. */
  readonly after: string | null;
  /** The newest update seen while catching up, in ISO 8601. */
  readonly newest: string;
}
