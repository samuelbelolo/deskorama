import type { CursorStore } from '../src/main/sources/cursor-store.ts';
import type { TokenStore } from '../src/main/sources/token-store.ts';

/**
 * Returns a token store and a cursor store kept in maps, standing in for the Keychain and the cursor file.
 * @example
 * const { tokens, cursors } = memoryStores({ 'src-1': 'token' });
 */
export function memoryStores(initialTokens: Record<string, string> = {}): {
  tokens: TokenStore & { readonly map: Map<string, string> };
  cursors: CursorStore & { readonly map: Map<string, string> };
} {
  const tokenMap = new Map(Object.entries(initialTokens));
  const cursorMap = new Map<string, string>();

  return {
    tokens: {
      map: tokenMap,
      read: (id) => tokenMap.get(id) ?? null,
      write: (id, token) => void tokenMap.set(id, token),
      remove: (id) => void tokenMap.delete(id),
    },
    cursors: {
      map: cursorMap,
      read: (id) => cursorMap.get(id) ?? null,
      write: (id, cursor) => void (cursor === null ? cursorMap.delete(id) : cursorMap.set(id, cursor)),
    },
  };
}
