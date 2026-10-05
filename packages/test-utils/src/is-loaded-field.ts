import type { ConnectorField, PickManyField, PickOneField } from '@deskorama/core';

/** Whether a field of each kind is picked among loaded options. Every kind is named, so a new one has to say. */
const LOADED: Record<ConnectorField['kind'], boolean> = {
  'pick-one': true,
  'pick-many': true,
  url: false,
  text: false,
  choice: false,
};

/**
 * Tells whether a field is picked among options its Connector loads, one value or several.
 * @example
 * isLoadedField({ kind: 'pick-one', key: 'organization', label, needs: [], placeholder: 'tramlo' }); // true
 * isLoadedField({ kind: 'text', key: 'project', label, placeholder: '12345' }); // false
 */
export function isLoadedField(field: ConnectorField): field is PickOneField | PickManyField {
  return LOADED[field.kind];
}
