import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SourceSettings } from '@deskorama/core';
import type { RecordedResponse } from '@deskorama/test-utils';

/** The Vercel project of Tramlo, a fictional product, as a person connects it. */
export const TRAMLO_VERCEL: SourceSettings = {
  name: 'Tramlo',
  values: { project: 'tramlo-web' },
  token: 'tramlo-vercel-token-for-tests',
};

/**
 * Returns a recorded `200` answer of Vercel whose body is one of the recordings next to this file.
 * @example
 * recorded('deployments-last-hour.json'); // { status: 200, headers: { … }, body: { deployments: […], … } }
 */
export function recorded(name: string): RecordedResponse {
  const body = JSON.parse(readFileSync(join(import.meta.dirname, 'recordings', name), 'utf8')) as unknown;

  return { status: 200, headers: { 'Content-Type': 'application/json' }, body };
}
