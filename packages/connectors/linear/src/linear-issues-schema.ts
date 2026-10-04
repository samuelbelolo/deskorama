import * as v from 'valibot';
import type { LinearIssuePage } from './linear-issues.ts';
import { TIME_SCHEMA } from './time-schema.ts';

/**
 * The answer of Linear's GraphQL API to the issues query, once its errors are ruled out: `data.issues`, with the
 * fields the query asks for. Typed against {@link LinearIssuePage}.
 * @example
 * { "data": { "issues": { "nodes": [{ "id": "6f1c…", "identifier": "ENG-142", "title": "Export invoices as CSV",
 *   "createdAt": "2026-10-04T13:41:07.512Z", "updatedAt": "2026-10-04T13:41:07.512Z", "completedAt": null,
 *   "state": { "type": "unstarted" } }], "pageInfo": { "hasNextPage": false, "endCursor": "6f1c…" } } } }
 */
export const LINEAR_ISSUES_SCHEMA: v.GenericSchema<unknown, { readonly data: { readonly issues: LinearIssuePage } }> =
  v.object({
    data: v.object({
      issues: v.object({
        nodes: v.array(
          v.object({
            id: v.pipe(v.string(), v.nonEmpty()),
            identifier: v.pipe(v.string(), v.nonEmpty()),
            title: v.string(),
            createdAt: TIME_SCHEMA,
            updatedAt: TIME_SCHEMA,
            completedAt: v.nullable(TIME_SCHEMA),
            state: v.object({ type: v.string() }),
          }),
        ),
        pageInfo: v.object({ hasNextPage: v.boolean(), endCursor: v.nullable(v.string()) }),
      }),
    }),
  });
