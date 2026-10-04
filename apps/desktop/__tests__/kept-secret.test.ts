import { describe, expect, test } from 'vitest';
import { keptSecret } from '../src/main/kept-secret.ts';
import { memoryStores } from './memory-stores.ts';

describe('a kept secret', () => {
  test('is drawn once, then read back at every launch', () => {
    const { tokens } = memoryStores();
    let draws = 0;
    const draw = (): string => `drawn-${++draws}`;

    expect(keptSecret(tokens, 'local-webhook', draw)).toBe('drawn-1');
    expect(keptSecret(tokens, 'local-webhook', draw)).toBe('drawn-1');
    expect(tokens.map.get('local-webhook')).toBe('drawn-1');
  });

  test('still serves this launch when the Keychain refuses it', () => {
    const refusing = {
      read: (): never => {
        throw new Error('The user name or passphrase you entered is not correct.');
      },
      write: (): never => {
        throw new Error('The user name or passphrase you entered is not correct.');
      },
      remove: () => {},
    };

    expect(keptSecret(refusing, 'local-webhook', () => 'drawn-1')).toBe('drawn-1');
  });
});
