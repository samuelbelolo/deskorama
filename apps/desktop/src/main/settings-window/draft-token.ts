import type { SourceDraft } from '../../shared/source-draft.ts';
import type { TokenStore } from '../sources/token-store.ts';

/**
 * Returns the token a draft is tested or listed with: the one typed, else the one in the Keychain for an edited
 * Source that keeps its own, else null.
 * @example
 * draftToken({ id: null, token: ' rk_fictional_0001 ' }, tokens); // 'rk_fictional_0001'
 * draftToken({ id: 'src-1', token: '' }, tokens); // the token kept for "src-1", or null when there is none
 * draftToken({ id: null, token: '' }, tokens); // null
 */
export function draftToken(draft: Pick<SourceDraft, 'id' | 'token'>, tokens: Pick<TokenStore, 'read'>): string | null {
  return draft.token.trim() || (draft.id === null ? null : tokens.read(draft.id));
}
