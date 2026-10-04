import type { SourceSettings } from '@deskorama/core';
import type { RecordedResponse } from '@deskorama/test-utils';
import { readDoc } from './read-doc.ts';

/** The Feed of Tramlo, a fictional product, as a person connects it. */
export const TRAMLO_FEED: SourceSettings = {
  name: 'Tramlo',
  values: { url: 'https://api.tramlo.example/deskorama/events' },
  token: 'tramlo-feed-token-for-tests',
};

/**
 * Returns a recorded `200` answer of the Tramlo Feed whose body is a published example page.
 * @example
 * recordedPage('first-page.json', '"p1"'); // { status: 200, headers: { ETag: '"p1"' }, body: { events: […], … } }
 */
export function recordedPage(example: string, etag?: string): RecordedResponse {
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...(etag === undefined ? {} : { ETag: etag }) },
    body: readDoc(`examples/valid/${example}`),
  };
}
