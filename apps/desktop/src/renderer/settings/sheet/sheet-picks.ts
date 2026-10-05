import { pickedValues, type Language } from '@deskorama/core';
import type { ConnectorView } from '../../../shared/settings-snapshot.ts';
import { pickField, type PickField } from './pick-field.ts';
import type { SheetStart } from './sheet-start.ts';

/** The fields of a connection sheet picked from what the token can see, and what the draft keeps of them. */
export interface SheetPicks {
  /** Every such field, in the Connector's own order. */
  readonly all: readonly PickField[];
  /** By key, the value of each field that holds one. */
  readonly values: () => (readonly [string, string])[];
  /** By key, the values of each field that holds several; undefined when the Connector has no such field. */
  readonly lists: () => Record<string, string[]> | undefined;
}

/**
 * Returns the fields of a Connector picked from what the token can see, holding the values of `start`. A field
 * that holds several opens on the one value a Source saved before it kept.
 * @example
 * sheetPicks(vercel, { id: 'src-1', name: 'Tramlo', values: { project: 'tramlo-web' }, interval: null }, 'en').lists();
 * // { projects: ['tramlo-web'] }
 */
export function sheetPicks(connector: ConnectorView, start: SheetStart, lang: Language): SheetPicks {
  const all = connector.fields.flatMap((field) => {
    if (field.kind === 'pick-many') return [pickField(field, pickedValues(start, field.key, field.formerly), lang)];

    const held = (start.values[field.key] ?? '').trim();

    return field.kind === 'pick-one' ? [pickField(field, held === '' ? [] : [held], lang)] : [];
  });

  const one = all.filter((pick) => pick.field.kind === 'pick-one');
  const several = all.filter((pick) => pick.field.kind === 'pick-many');

  return {
    all,
    values: () => one.map((pick) => [pick.field.key, pick.values()[0] ?? ''] as const),

    lists: () =>
      several.length === 0 ? undefined : Object.fromEntries(several.map((pick) => [pick.field.key, pick.values()])),
  };
}
