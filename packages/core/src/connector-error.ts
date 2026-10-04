import type { ConnectorFailure } from './connector-failure.ts';

/**
 * The only error a Connector's `poll` throws: it carries the {@link ConnectorFailure} the platform acts on, and a
 * message for the logs that never contains the token.
 * @example
 * throw new ConnectorError({ kind: 'permission', permission: 'Actions: read' }, 'GitHub answered 403');
 */
export class ConnectorError extends Error {
  readonly failure: ConnectorFailure;

  constructor(failure: ConnectorFailure, message: string) {
    super(message);
    this.name = 'ConnectorError';
    this.failure = failure;
  }
}
