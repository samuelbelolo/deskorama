import { ARCHETYPES, DEPLOY_STEPS, GAUGE_ROLES, RARITIES } from '@deskorama/core';
import * as v from 'valibot';
import type { PostedEvent } from './posted-event.ts';

/**
 * A time with its zone, as `docs/feed/feed-page.schema.json` publishes it: `T` between date and time, then `Z` or
 * an offset with a colon. Narrower than ISO 8601, so every accepted value is one `Date.parse` reads.
 */
const TIMESTAMP =
  /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/u;

/**
 * Returns a string schema of at most `max` characters, counted as code points before trimming, the way JSON
 * Schema's `maxLength` counts them, so the app and the published schema accept the same strings.
 * @example
 * v.parse(text(16), '🚀🚀🚀'); // '🚀🚀🚀', 3 characters
 */
function text(max: number) {
  return v.pipe(
    v.string(),
    v.check((value) => Array.from(value).length <= max, `at most ${max} characters`),
    v.trim(),
  );
}

/** The words of an Event in one language: the fact is required, the detail and the tag may be left out. */
const WORDS = v.strictObject({
  label: v.pipe(text(120), v.nonEmpty()),
  detail: v.optional(text(200), ''),
  tag: v.optional(text(16), ''),
});

/** The fields of an Event in its JSON form; `id` is optional here and required in a Feed. */
const ENTRIES = {
  id: v.optional(
    v.pipe(
      v.string(),
      v.nonEmpty(),
      v.check((id) => Array.from(id).length <= 200, 'at most 200 characters'),
    ),
  ),
  kind: v.pipe(
    v.string(),
    v.nonEmpty(),
    v.check((kind) => Array.from(kind).length <= 100, 'at most 100 characters'),
  ),
  archetype: v.optional(v.nullable(v.picklist(ARCHETYPES)), null),
  recognised: v.optional(v.boolean(), true),
  rarity: v.optional(v.picklist(RARITIES), 'common'),
  source: v.pipe(text(40), v.nonEmpty()),
  at: v.optional(v.pipe(v.string(), v.regex(TIMESTAMP, 'a time with its zone, e.g. 2026-10-04T13:58:00Z'))),
  text: v.pipe(
    v.strictObject({ fr: v.optional(WORDS), en: v.optional(WORDS) }),
    v.check((words) => words.fr !== undefined || words.en !== undefined, 'text needs French, English or both'),
  ),
  step: v.optional(v.picklist(DEPLOY_STEPS)),
  gauge: v.optional(v.strictObject({ role: v.picklist(GAUGE_ROLES), by: v.pipe(v.number(), v.finite()) })),
};

/**
 * One Event in its JSON form, as a script posts it to the Local webhook. Only `kind`, `source` and the words in
 * one language are required; unknown fields are rejected, so a typo fails loudly instead of being ignored. Typed
 * against {@link PostedEvent}, so the schema and the type cannot drift apart, and read through Standard Schema
 * (`EVENT_SCHEMA['~standard']`), so the validation library can change without touching its callers.
 * @example
 * { "kind": "deploy.done", "archetype": "deploy", "step": "succeeded", "source": "Tramlo CI",
 *   "text": { "en": { "label": "Deploy succeeded", "detail": "v2.5.0 in production" } } }
 */
export const EVENT_SCHEMA: v.GenericSchema<unknown, PostedEvent> = v.strictObject(ENTRIES);

/**
 * One Event in its JSON form with a required `id`, as a Feed returns it: the platform drops an Event it has
 * already played by its id, so a Feed may return a page again without playing anything twice.
 * @example
 * { "id": "evt_1042", "kind": "invoice.paid", "archetype": "money", "source": "Tramlo",
 *   "text": { "en": { "label": "Payment received" } } }
 */
export const IDENTIFIED_EVENT_SCHEMA: v.GenericSchema<unknown, PostedEvent & { readonly id: string }> = v.strictObject({
  ...ENTRIES,
  id: v.pipe(
    v.string(),
    v.nonEmpty(),
    v.check((id) => Array.from(id).length <= 200, 'at most 200 characters'),
  ),
});
