import { ConnectorError, type ConnectorResponse } from '@deskorama/core';
import * as v from 'valibot';
import { LINEAR_PERMISSION } from './linear-config.ts';
import { quotaReset } from './quota-reset.ts';

/** The errors of a GraphQL answer, as Linear words them: the kind of error in `extensions.type` or `.code`. */
const ERRORS = v.object({
  errors: v.pipe(
    v.array(
      v.object({
        message: v.optional(v.string()),
        extensions: v.optional(v.object({ type: v.optional(v.string()), code: v.optional(v.string()) })),
      }),
    ),
    v.nonEmpty(),
  ),
});

/**
 * Returns the {@link ConnectorError} the GraphQL errors of a Linear answer mean, or null when it has none. Linear
 * answers an error with `400` and names it inside: a refused key, a missing permission, or a rate limit whose
 * reset it gives in milliseconds since the epoch. Any other error is an unexpected response.
 * @example
 * graphQlFailure({ errors: [{ extensions: { type: 'authentication error' } }] }, response, now);
 * // ConnectorError { failure: { kind: 'auth' } }
 */
export function graphQlFailure(body: unknown, response: ConnectorResponse, now: number): ConnectorError | null {
  const parsed = v.safeParse(ERRORS, body);

  if (!parsed.success) return null;

  const [error] = parsed.output.errors;

  const kind = `${error?.extensions?.type ?? ''} ${error?.extensions?.code ?? ''}`.toLowerCase();

  const said = `Linear answered ${response.status}: ${error?.message ?? 'an error'}`;

  if (kind.includes('authentication')) return new ConnectorError({ kind: 'auth' }, said);

  if (kind.includes('forbidden'))
    return new ConnectorError({ kind: 'permission', permission: LINEAR_PERMISSION }, said);

  if (kind.includes('ratelimited')) {
    return new ConnectorError({ kind: 'rate-limit', resetAt: quotaReset(response.headers, now) }, said);
  }

  return new ConnectorError({ kind: 'invalid-response' }, said);
}
