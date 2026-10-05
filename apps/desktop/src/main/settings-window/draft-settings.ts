import type { SourceSettings } from '@deskorama/core';
import type { SourceDraft } from '../../shared/source-draft.ts';

/**
 * Returns the settings a Connector receives from a draft: its name trimmed, what its fields hold, and the token to
 * ask with.
 * @example
 * draftSettings({ name: ' Tramlo ', values: { organization: 'tramlo' }, lists: { projects: [] } }, 'token-1');
 * // { name: 'Tramlo', values: { organization: 'tramlo' }, lists: { projects: [] }, token: 'token-1' }
 */
export function draftSettings(draft: Pick<SourceDraft, 'name' | 'values' | 'lists'>, token: string): SourceSettings {
  return { name: draft.name.trim(), values: draft.values, lists: draft.lists, token };
}
