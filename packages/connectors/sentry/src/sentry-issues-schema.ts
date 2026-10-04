import * as v from 'valibot';
import type { SentryIssue } from './sentry-issue.ts';
import { TIME_SCHEMA } from './time-schema.ts';

/** A count of events, as Sentry writes it: a string of digits. */
const COUNT = v.pipe(v.string(), v.digits());

/**
 * The answer of `GET /api/0/organizations/{organization}/issues/`, as Sentry returns it: a list of issues. Only the
 * fields the Connector reads are checked, so Sentry may add others. Sentry scopes the top-level first time and count
 * to the period searched and gives the issue's whole life under `lifetime`, which wins when present, so an old error
 * back after a quiet fortnight is not mistaken for a new one. Typed against {@link SentryIssue}.
 * @example
 * [{ "id": "4821", "shortId": "TRAMLO-WEB-3F", "firstSeen": "2026-10-04T13:48:12Z", "lastSeen": "2026-10-04T13:57:40Z",
 *   "count": "12", "lifetime": { "firstSeen": "2026-10-04T13:48:12Z", "count": "12" }, "metadata": { "type": "TypeError" } }]
 */
export const SENTRY_ISSUES_SCHEMA: v.GenericSchema<unknown, readonly SentryIssue[]> = v.array(
  v.pipe(
    v.object({
      id: v.pipe(v.string(), v.nonEmpty()),
      shortId: v.pipe(v.string(), v.nonEmpty()),
      firstSeen: TIME_SCHEMA,
      lastSeen: TIME_SCHEMA,
      count: COUNT,
      lifetime: v.optional(v.object({ firstSeen: v.nullish(TIME_SCHEMA), count: v.optional(COUNT) })),
      metadata: v.optional(v.object({ type: v.optional(v.string()) })),
    }),
    v.transform((issue) => ({
      id: issue.id,
      shortId: issue.shortId,
      firstSeen: issue.lifetime?.firstSeen ?? issue.firstSeen,
      lastSeen: issue.lastSeen,
      count: issue.lifetime?.count ?? issue.count,
      type: issue.metadata?.type ?? '',
    })),
  ),
);
