import { ConnectorError, type ConnectorOption, type OptionsInput } from '@deskorama/core';
import { getVercel } from './get-vercel.ts';
import type { ListedProject } from './project-list.ts';
import { PROJECT_LIST_SCHEMA } from './project-list-schema.ts';
import { VERCEL_PROJECTS_FIELD } from './vercel-config.ts';

/** How many projects one page holds. */
const PAGE_SIZE = 100;

/** How many pages are read at most: a team with more projects than that types the missing ones by hand. */
const MAX_PAGES = 5;

/**
 * Returns the projects the token can see, by name, each kept by its ID, which is what Vercel filters several
 * projects on. A token scoped to a team lists that team's projects; one scoped to a single project is refused.
 * Throws the {@link ConnectorError} a failed answer means.
 * @example
 * await listVercelOptions({ field: 'projects', settings: { name: '', values: {}, token }, fetch, now });
 * // [{ value: 'prj_api', label: 'tramlo-api' }, { value: 'prj_web', label: 'tramlo-web' }]
 */
export async function listVercelOptions(input: OptionsInput): Promise<ConnectorOption[]> {
  if (input.field !== VERCEL_PROJECTS_FIELD) {
    throw new ConnectorError({ kind: 'invalid-response' }, `Vercel lists no options for ${input.field}.`);
  }

  const projects = await readPages(input, null, MAX_PAGES);

  return projects
    .map((project) => ({ value: project.id, label: project.name }))
    .toSorted((a, b) => a.label.localeCompare(b.label));
}

/**
 * Returns the projects of the page that starts at `from` and of the pages after it, `left` pages at most.
 * @example
 * await readPages(input, null, 5); // [{ id: 'prj_web', name: 'tramlo-web' }, …]
 */
async function readPages(input: OptionsInput, from: string | null, left: number): Promise<ListedProject[]> {
  const query = { limit: String(PAGE_SIZE), ...(from === null ? {} : { from }) };

  const page = await getVercel(input, '/v10/projects', query, PROJECT_LIST_SCHEMA, 'The project list');

  if (page === null) throw new ConnectorError({ kind: 'invalid-response' }, 'Vercel has no project list.');

  if (page.next === null || left <= 1) return [...page.projects];

  return [...page.projects, ...(await readPages(input, page.next, left - 1))];
}
