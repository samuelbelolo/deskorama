import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SourceSettings } from '@deskorama/core';
import type { RecordedResponse } from '@deskorama/test-utils';

/** The Vercel project of Tramlo, a fictional product, as a Source saved for a single project keeps it: by name. */
export const TRAMLO_VERCEL: SourceSettings = {
  name: 'Tramlo',
  values: { project: 'tramlo-web' },
  token: 'tramlo-vercel-token-for-tests',
};

/** The IDs of Tramlo's website and API, as the project list gives them. */
export const TRAMLO_WEB = 'prj_W3bTr4mLo0001FictionalAaBb';
export const TRAMLO_API = 'prj_Ap1Tr4mLo0002FictionalCcDd';

/** Tramlo's website and API followed by one Source, as a person picks them from the list. */
export const TRAMLO_PROJECTS: SourceSettings = {
  name: 'Tramlo',
  values: {},
  lists: { projects: [TRAMLO_WEB, TRAMLO_API] },
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
