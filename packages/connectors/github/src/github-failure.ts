import { ConnectorError, rateLimitReset, responseFailure, type ConnectorResponse } from '@deskorama/core';

/**
 * Returns the {@link ConnectorError} a GitHub answer means, or null for a success or a `304`. On top of the classes
 * core already reads, a `403` is a secondary rate limit, not a missing permission, when it carries `Retry-After` or
 * says so in its message.
 * @example
 * await githubFailure({ status: 403, headers: retryAfter60, … }, now, 'Actions: read');
 * // ConnectorError { failure: { kind: 'rate-limit', resetAt: now + 60_000 } }
 */
export async function githubFailure(
  response: ConnectorResponse,
  now: number,
  permission: string,
): Promise<ConnectorError | null> {
  const { status, headers } = response;

  const limited = status === 403 && (headers.get('retry-after') !== null || (await mentionsRateLimit(response)));

  if (limited) {
    return new ConnectorError(
      { kind: 'rate-limit', resetAt: rateLimitReset(headers, now) },
      `GitHub answered ${status}.`,
    );
  }

  return responseFailure(response, now, permission);
}

/**
 * Returns whether a refusal's body talks about a rate limit, as GitHub's secondary limits do without any header.
 * @example
 * await mentionsRateLimit(response); // true for "You have exceeded a secondary rate limit."
 */
async function mentionsRateLimit(response: ConnectorResponse): Promise<boolean> {
  try {
    return /rate limit/i.test(await response.text());
  } catch {
    return false;
  }
}
