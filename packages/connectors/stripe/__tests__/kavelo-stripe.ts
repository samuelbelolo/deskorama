import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SourceSettings } from '@deskorama/core';
import type { RecordedResponse } from '@deskorama/test-utils';

/** The Stripe account of Kavelo, a fictional subscription product, as a person connects it. */
export const KAVELO_STRIPE: SourceSettings = {
  name: 'Kavelo',
  values: {},
  token: 'rk_live_kavelo-restricted-key-for-tests',
};

/**
 * Returns a recorded answer of Stripe whose body is one of the recordings beside this file.
 * @example
 * recordedStripe('events-page.json'); // { status: 200, headers: { … }, body: { object: 'list', data: [ … ] } }
 * recordedStripe('unknown-cursor.json', 404); // { status: 404, …, body: { error: { code: 'resource_missing' } } }
 */
export function recordedStripe(recording: string, status = 200): RecordedResponse {
  const body: unknown = JSON.parse(readFileSync(join(import.meta.dirname, 'recordings', recording), 'utf8'));

  return { status, headers: { 'Content-Type': 'application/json', 'Request-Id': 'req_KaveloTests' }, body };
}
