/**
 * What a Feed resumes from, kept inside the opaque cursor the platform persists: the backend's own cursor, and the
 * ETag of the last answer to that very cursor, for a `304 Not Modified`.
 */
export interface FeedState {
  readonly cursor: string | null;
  readonly etag: string | null;
}
