import type { Language } from '@deskorama/core';
import type { SettingsSnapshot, SourceView } from '../../shared/settings-bridge.ts';
import { element } from './element.ts';
import { SETTINGS_TEXT } from './settings-text.ts';
import { statusLine } from './status-line.ts';

/** What the list's buttons do. */
export interface SourceListActions {
  readonly add: (connector: string) => void;
  readonly edit: (source: SourceView) => void;
  readonly remove: (source: SourceView) => void;
}

/**
 * Returns the panel listing the connected Sources, each with its state, an edit and a remove button (remove asks
 * once more), and a button per Connector to add a Source.
 * @example
 * root.replaceChildren(renderSourceList(snapshot, 'fr', { add, edit, remove }));
 */
export function renderSourceList(snapshot: SettingsSnapshot, lang: Language, actions: SourceListActions): HTMLElement {
  const text = SETTINGS_TEXT[lang];

  const rows = snapshot.sources.map((source) => {
    const remove = element('button', { text: text.remove });

    remove.addEventListener('click', () => {
      if (remove.dataset['armed'] === 'true') return actions.remove(source);

      remove.dataset['armed'] = 'true';
      remove.textContent = text.confirmRemove;
    });

    const edit = element('button', { text: text.edit });

    edit.addEventListener('click', () => actions.edit(source));

    return element('div', { className: 'source' }, [
      element('span', { className: 'source-name', text: source.name }),
      statusLine(source.status, lang),
      element('div', { className: 'actions' }, [edit, remove]),
    ]);
  });

  const adds = snapshot.connectors.map((connector) => {
    const button = element('button', { className: 'primary', text: text.add(connector.title[lang]) });

    button.addEventListener('click', () => actions.add(connector.id));

    return button;
  });

  const empty = rows.length === 0 ? [element('p', { className: 'hint', text: text.noSource })] : [];

  return element('section', { className: 'panel' }, [
    ...empty,
    ...rows,
    element('div', { className: 'buttons' }, adds),
  ]);
}
