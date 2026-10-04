import type { ConnectorFailure } from '@deskorama/core';

/**
 * Where a Source stands: not polled yet, its last poll worked, or it is failing. A refused token or a missing
 * permission stops it until the person edits the Source; any other failure is retried.
 */
export type SourceStatus =
  | { readonly state: 'waiting' }
  | { readonly state: 'ok'; readonly at: number }
  | { readonly state: 'failing'; readonly failure: ConnectorFailure; readonly at: number };
