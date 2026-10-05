import type { PickManyField } from '@deskorama/core';

/** How many values a field that holds several keeps at most, when its Connector sets no limit. */
const MAX_PICKED = 100;

/**
 * Returns how many values a field that holds several keeps at most: the limit its Connector sets, or the app's own.
 * @example
 * pickLimit({ max: 20 }); // 20
 * pickLimit({}); // 100
 */
export function pickLimit(field: Pick<PickManyField, 'max'>): number {
  return field.max ?? MAX_PICKED;
}
