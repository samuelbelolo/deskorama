/**
 * Why a poll failed, which decides what happens next: a refused token stops the Connector until the person gives a
 * new one, a missing permission is named, a rate limit waits for the reset the service announced, and a network
 * failure or an unexpected response is retried later, further apart each time.
 */
export type ConnectorFailure =
  | { readonly kind: 'auth' }
  | { readonly kind: 'permission'; readonly permission: string }
  | { readonly kind: 'rate-limit'; readonly resetAt: number }
  | { readonly kind: 'network' }
  | { readonly kind: 'invalid-response' };
