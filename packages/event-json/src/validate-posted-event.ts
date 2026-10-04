import { describeIssues } from '@deskorama/core';
import { EVENT_SCHEMA } from './event-schema.ts';
import type { PostedEvent } from './posted-event.ts';

/** The outcome of validating a posted body: the Event, or one readable line per problem. */
export type Validation =
  | { readonly ok: true; readonly event: PostedEvent }
  | { readonly ok: false; readonly issues: string[] };

/**
 * Validates a parsed JSON Event against the Event schema through its Standard Schema interface, so the validation
 * library can change without touching the caller.
 * @example
 * await validatePostedEvent({ kind: 'deploy.done', source: 'CI', text: { en: { label: 'Deployed' } } });
 * // { ok: true, … }
 * await validatePostedEvent({ kind: 'deploy.done' }); // { ok: false, issues: ['source: Invalid key: …', …] }
 */
export async function validatePostedEvent(body: unknown): Promise<Validation> {
  const result = await EVENT_SCHEMA['~standard'].validate(body);

  if (result.issues === undefined) return { ok: true, event: result.value };

  return { ok: false, issues: describeIssues(result.issues) };
}
