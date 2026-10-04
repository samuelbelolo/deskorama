import type { TokenStore } from './sources/token-store.ts';
import { writeLog } from './write-log.ts';

/**
 * Returns the secret kept under `key`, or draws one with `draw`, keeps it and returns it. When the store cannot be
 * written, the drawn secret still serves this launch.
 * @example
 * keptSecret(createKeychain(''), 'local-webhook', () => randomBytes(24).toString('base64url'));
 * // the same secret at every launch
 */
export function keptSecret(store: TokenStore, key: string, draw: () => string): string {
  const kept = readOrNull(store, key);

  if (kept !== null) return kept;

  const drawn = draw();

  try {
    store.write(key, drawn);
  } catch (error) {
    writeLog('keychain', `could not keep the ${key} secret: ${String(error)}`);
  }

  return drawn;
}

/**
 * Returns the secret kept under `key`, or null when there is none or the store cannot be read.
 * @example
 * readOrNull(tokens, 'local-webhook'); // "f3a9…"
 */
function readOrNull(store: TokenStore, key: string): string | null {
  try {
    return store.read(key);
  } catch (error) {
    writeLog('keychain', `could not read the ${key} secret: ${String(error)}`);

    return null;
  }
}
