import type { SourceDraft } from '../../shared/settings-bridge.ts';
import type { SourceEntry } from '../sources/source-entry.ts';

/** The Sources once a draft is saved, and the entry it saved. */
export interface AppliedDraft {
  readonly sources: SourceEntry[];
  readonly saved: SourceEntry;
}

/**
 * Returns the Sources once a checked draft is saved: a new Source is added last with `newId`, an edited one keeps
 * its place. Returns null for an edit of a Source that is no longer there. Names and values are trimmed; the token
 * never enters an entry.
 * @example
 * const draft = { id: null, connector: 'feed', name: ' Tramlo ', values: { url: 'https://…' }, token: 't' };
 * applyDraft([], draft, 'src-1');
 * // { sources: [tramlo], saved: { id: 'src-1', connector: 'feed', name: 'Tramlo', values: { url: 'https://…' } } }
 */
export function applyDraft(entries: readonly SourceEntry[], draft: SourceDraft, newId: string): AppliedDraft | null {
  const values = Object.fromEntries(Object.entries(draft.values).map(([key, value]) => [key, value.trim()]));

  const saved: SourceEntry = { id: draft.id ?? newId, connector: draft.connector, name: draft.name.trim(), values };

  if (draft.id === null) return { sources: [...entries, saved], saved };

  if (!entries.some((existing) => existing.id === draft.id)) return null;

  return { sources: entries.map((existing) => (existing.id === draft.id ? saved : existing)), saved };
}
