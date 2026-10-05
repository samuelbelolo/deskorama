import { tidyValues } from '@deskorama/core';
import type { SourceDraft } from '../../shared/source-draft.ts';
import type { SourceEntry } from '../sources/source-entry.ts';

/** The Sources once a draft is saved, and the entry it saved. */
export interface AppliedDraft {
  readonly sources: SourceEntry[];
  readonly saved: SourceEntry;
}

/**
 * Returns the Sources once a checked draft is saved: a new Source is added last with `newId`, an edited one keeps
 * its place. Returns null for an edit of a Source that is no longer there. Names and values are trimmed, and a
 * field that holds several keeps each once; the token never enters an entry, and a Source left on its Connector's
 * default interval keeps none.
 * @example
 * const draft = { id: null, connector: 'feed', name: ' Tramlo ', values: { url: 'https://…' }, token: 't', interval: null };
 * applyDraft([], draft, 'src-1');
 * // { sources: [tramlo], saved: { id: 'src-1', connector: 'feed', name: 'Tramlo', values: { url: 'https://…' } } }
 */
export function applyDraft(entries: readonly SourceEntry[], draft: SourceDraft, newId: string): AppliedDraft | null {
  const values = Object.fromEntries(Object.entries(draft.values).map(([key, value]) => [key, value.trim()]));

  const saved: SourceEntry = {
    id: draft.id ?? newId,
    connector: draft.connector,
    name: draft.name.trim(),
    values,
    ...(draft.lists === undefined ? {} : { lists: tidyLists(draft.lists) }),
    ...(draft.interval === null ? {} : { interval: draft.interval }),
  };

  if (draft.id === null) return { sources: [...entries, saved], saved };

  if (!entries.some((existing) => existing.id === draft.id)) return null;

  return { sources: entries.map((existing) => (existing.id === draft.id ? saved : existing)), saved };
}

/**
 * Returns the lists of a draft as an entry keeps them: every value trimmed, none empty, each once.
 * @example
 * tidyLists({ projects: [' prj_web ', 'prj_api', '', 'prj_web'] }); // { projects: ['prj_web', 'prj_api'] }
 */
function tidyLists(lists: Readonly<Record<string, readonly string[]>>): Record<string, string[]> {
  return Object.fromEntries(Object.entries(lists).map(([key, values]) => [key, tidyValues(values)]));
}
