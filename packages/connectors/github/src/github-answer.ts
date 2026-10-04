import type { ConnectorResponse } from '@deskorama/core';

/**
 * What GitHub answered to one read: the JSON body and headers when it changed, `unchanged` for a `304 Not
 * Modified`, `missing` for a `404`, such as a run or a deployment deleted since, or `empty` for the `409` of a
 * repository with no commit yet.
 */
export type GithubAnswer =
  | { readonly kind: 'changed'; readonly body: unknown; readonly headers: ConnectorResponse['headers'] }
  | { readonly kind: 'unchanged' }
  | { readonly kind: 'missing' }
  | { readonly kind: 'empty' };
