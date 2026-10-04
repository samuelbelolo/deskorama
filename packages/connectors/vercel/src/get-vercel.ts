import {
  parsePayload,
  readJson,
  responseFailure,
  sendRequest,
  type PollInput,
  type StandardSchema,
} from '@deskorama/core';
import { VERCEL_PERMISSION } from './vercel-config.ts';

/** Where the Vercel REST API answers. */
const VERCEL_API = 'https://api.vercel.com';

/**
 * Sends a `GET` to Vercel with the token and returns the answer validated by `schema`, or null when Vercel answers
 * 404 because it does not know what was asked. Throws the {@link ConnectorError} any other failed answer means.
 * @example
 * await getVercel(input, '/v13/deployments/dpl_9Xa1', {}, DEPLOYMENT_STATUS_SCHEMA, 'A deployment');
 * // { id: 'dpl_9Xa1', readyState: 'ERROR', ready: 1791122280000 }
 */
export async function getVercel<Output>(
  input: PollInput,
  path: string,
  query: Readonly<Record<string, string>>,
  schema: StandardSchema<Output>,
  what: string,
): Promise<Output | null> {
  const url = new URL(path, VERCEL_API);

  for (const [name, value] of Object.entries(query)) url.searchParams.set(name, value);

  const headers = { Accept: 'application/json', Authorization: `Bearer ${input.settings.token}` };

  const response = await sendRequest(input.fetch, url.href, { method: 'GET', headers });

  if (response.status === 404) return null;

  const failure = responseFailure(response, input.now, VERCEL_PERMISSION);

  if (failure !== null) throw failure;

  return parsePayload(schema, await readJson(response, what), what);
}
