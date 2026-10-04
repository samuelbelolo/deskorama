/**
 * Where secrets live, by key: Source tokens by Source id, the Local webhook's secret. The macOS Keychain in the
 * app, a map in tests; nothing else ever holds a secret.
 */
export interface TokenStore {
  /** The secret kept under `key`, or null when there is none. */
  read(key: string): string | null;
  write(key: string, secret: string): void;
  /** Deletes the secret kept under `key`; nothing happens when there is none. */
  remove(key: string): void;
}
