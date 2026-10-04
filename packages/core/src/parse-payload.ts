import { ConnectorError } from './connector-error.ts';
import { describeIssues } from './describe-issues.ts';
import type { StandardSchema } from './standard-schema.ts';

/**
 * Returns `value` validated by `schema`, or throws an `invalid-response` {@link ConnectorError} naming the first
 * problems. A Connector passes every external payload through it, so a changed API fails loudly in one place.
 * @example
 * const page = await parsePayload(FEED_PAGE_SCHEMA, json, 'The Feed page'); // typed, or a ConnectorError
 */
export async function parsePayload<Output>(
  schema: StandardSchema<Output>,
  value: unknown,
  what: string,
): Promise<Output> {
  const result = await schema['~standard'].validate(value);

  if (result.issues === undefined) return result.value;

  const issues = describeIssues(result.issues).slice(0, 3).join('; ');

  throw new ConnectorError({ kind: 'invalid-response' }, `${what} is not valid: ${issues}`);
}
