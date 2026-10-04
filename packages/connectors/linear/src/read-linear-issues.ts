import { parsePayload, readJson, responseFailure, type ConnectorResponse } from '@deskorama/core';
import { graphQlFailure } from './graphql-failure.ts';
import { LINEAR_PERMISSION } from './linear-config.ts';
import type { LinearIssuePage } from './linear-issues.ts';
import { LINEAR_ISSUES_SCHEMA } from './linear-issues-schema.ts';

/**
 * Returns the page of issues a Linear answer holds, or throws the {@link ConnectorError} it means. Linear answers its
 * own errors with 400 and names them inside; every other status reads as for any service.
 * @example
 * await readLinearIssues(response, now); // { nodes: [{ identifier: 'ENG-142', … }], pageInfo: { hasNextPage: false, … } }
 */
export async function readLinearIssues(response: ConnectorResponse, now: number): Promise<LinearIssuePage> {
  const failure = response.status === 400 ? null : responseFailure(response, now, LINEAR_PERMISSION);

  if (failure !== null) throw failure;

  const json = await readJson(response, 'The issues');

  const named = graphQlFailure(json, response, now);

  if (named !== null) throw named;

  return (await parsePayload(LINEAR_ISSUES_SCHEMA, json, 'The issues')).data.issues;
}
