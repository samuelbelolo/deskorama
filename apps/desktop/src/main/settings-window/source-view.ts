import type { Language } from '@deskorama/core';
import type { SourceView } from '../../shared/settings-snapshot.ts';
import type { SourceState } from '../sources/create-source-runtime.ts';
import { seenEvent } from './seen-event.ts';

/**
 * Returns a connected Source as the settings window shows it: what its entry holds, where it stands and the last
 * Event it sent, in the display language. Never its token.
 * @example
 * sourceView({ entry: tramlo, status: { state: 'waiting' }, last: null }, 'en');
 * // { id: 'src-1', connector: 'feed', name: 'Tramlo', values: { url: 'https://…' }, lists: undefined,
 * //   interval: null, status: { state: 'waiting' }, last: null }
 */
export function sourceView(state: SourceState, lang: Language): SourceView {
  const { entry, status, last } = state;

  return {
    id: entry.id,
    connector: entry.connector,
    name: entry.name,
    values: entry.values,
    lists: entry.lists,
    interval: entry.interval ?? null,
    status,
    last: last === null ? null : seenEvent(last, lang),
  };
}
