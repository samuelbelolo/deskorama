import * as v from 'valibot';
import type { ProjectList } from './project-list.ts';

/** A project as Vercel lists it; only its ID and name are checked, so Vercel may add other fields. */
const PROJECT = v.object({ id: v.pipe(v.string(), v.nonEmpty()), name: v.pipe(v.string(), v.nonEmpty()) });

/**
 * A page of `GET /v10/projects`, as Vercel returns it: the projects with where the next page starts, a continuation
 * token or a timestamp, or the bare list Vercel documents as its older form, which has no next page. Typed against
 * {@link ProjectList}.
 * @example
 * { "projects": [{ "id": "prj_web", "name": "tramlo-web", "accountId": "team_tramlo" }],
 *   "pagination": { "count": 1, "next": null } }
 */
export const PROJECT_LIST_SCHEMA: v.GenericSchema<unknown, ProjectList> = v.union([
  v.pipe(
    v.array(PROJECT),
    v.transform((projects) => ({ projects, next: null })),
  ),
  v.pipe(
    v.object({
      projects: v.array(PROJECT),
      pagination: v.object({ next: v.nullable(v.union([v.string(), v.number()])) }),
    }),
    v.transform(({ projects, pagination }) => ({
      projects,
      next: pagination.next === null ? null : String(pagination.next),
    })),
  ),
]);
