import { Entry } from '@napi-rs/keyring';
import type { TokenStore } from './token-store.ts';

/** The Keychain service of every token the app keeps, as Keychain Access shows it. */
const SERVICE = 'Deskorama';

/**
 * Returns a store of the app's secrets in the login Keychain: one generic password per key, under the service
 * "Deskorama" and the account `prefix` + key ("source:<id>" for a Source's token). A secret never touches a file.
 * @example
 * const tokens = createKeychain('source:');
 * tokens.write('src-1', token);
 * tokens.read('src-1'); // the token
 * tokens.remove('src-1'); // gone from the Keychain
 */
export function createKeychain(prefix: string): TokenStore {
  const entry = (key: string): Entry => new Entry(SERVICE, `${prefix}${key}`);

  return {
    read: (key) => entry(key).getPassword(),
    write: (key, secret) => entry(key).setPassword(secret),
    remove: (key) => void entry(key).deletePassword(),
  };
}
