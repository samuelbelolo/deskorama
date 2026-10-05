import { pickedValues, type ConnectorField } from '@deskorama/core';
import type { SourceEntry } from './source-entry.ts';

/**
 * Returns what a Source reads, as one string: what it holds for each field of its Connector, in the Connector's own
 * order, however it is stored, then the values no field declares. A list left out and an empty one read the same,
 * the order of the keys in `settings.json` does not count, and a value kept under the key a field replaced reads as
 * the list it became.
 * @example
 * readsOf({ values: {} }, fields) === readsOf({ values: {}, lists: { projects: [] } }, fields); // true
 * readsOf({ values: { project: 'tramlo-web' } }, fields); // '[[["tramlo-web"]],[]]', as { projects: ['tramlo-web'] } reads
 */
export function readsOf(entry: Pick<SourceEntry, 'values' | 'lists'>, fields: readonly ConnectorField[]): string {
  const held = fields.map((field) => {
    if (field.kind === 'pick-many') return pickedValues(entry, field.key, field.formerly);

    return (entry.values[field.key] ?? '').trim();
  });

  const declared = new Set(fields.flatMap((field) => declaredKeys(field)));

  // A value no field declares still tells two Sources apart: nothing says the Connector does not read it.
  const others = Object.entries(entry.values)
    .filter(([key]) => !declared.has(key))
    .toSorted(([a], [b]) => a.localeCompare(b));

  return JSON.stringify([held, others]);
}

/**
 * Returns the keys under which a Source may hold what `field` asks for: its own, and the one it replaced.
 * @example
 * declaredKeys(projectsField); // ['projects', 'project']
 */
function declaredKeys(field: ConnectorField): string[] {
  if (field.kind === 'pick-many' && field.formerly !== undefined) return [field.key, field.formerly];

  return [field.key];
}
