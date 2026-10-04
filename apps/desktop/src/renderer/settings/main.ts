// The settings window: lists the connected Sources, and adds, tests, edits and removes them through
// `window.settings`, the only way this sandboxed page reaches the main process.
import './settings.css';
import type { Language } from '@deskorama/core';
import type { SettingsSnapshot, SourceView } from '../../shared/settings-bridge.ts';
import { element } from './element.ts';
import { renderSourceForm, type FormStart } from './render-source-form.ts';
import { renderSourceList } from './render-source-list.ts';
import { SETTINGS_TEXT } from './settings-text.ts';

const lang: Language = new URLSearchParams(window.location.search).get('lang') === 'fr' ? 'fr' : 'en';
const text = SETTINGS_TEXT[lang];

const root = document.querySelector<HTMLElement>('#settings');

if (root === null) throw new Error('The settings page lacks #settings.');

document.documentElement.lang = lang;
document.title = text.windowTitle;

let snapshot: SettingsSnapshot = await window.settings.load();
let editing: { readonly connector: string; readonly start: FormStart } | null = null;

/**
 * Draws the window: the title, then the form while a Source is added or edited, else the list.
 * @example
 * render();
 */
function render(): void {
  const header = [element('h1', { text: text.title }), element('p', { className: 'lead', text: text.lead })];

  const connector = snapshot.connectors.find((candidate) => candidate.id === editing?.connector);

  if (editing === null || connector === undefined) {
    root?.replaceChildren(
      ...header,
      renderSourceList(snapshot, lang, { add, edit, remove: (source) => void remove(source).catch(render) }),
    );

    return;
  }

  const form = renderSourceForm(connector, editing.start, lang, {
    save: async (draft) => {
      const answer = await window.settings.save(draft);

      if (!answer.ok) return answer.problems;

      await reload();
      close();

      return [];
    },
    test: (draft) => window.settings.test(draft),
    cancel: close,
  });

  root?.replaceChildren(...header, form);
}

/**
 * Opens the form for a new Source of one Connector.
 * @example
 * add('feed');
 */
function add(connector: string): void {
  editing = { connector, start: { id: null, name: '', values: {} } };
  render();
}

/**
 * Opens the form on a connected Source.
 * @example
 * edit(tramlo);
 */
function edit(source: SourceView): void {
  editing = { connector: source.connector, start: { id: source.id, name: source.name, values: source.values } };
  render();
}

/**
 * Removes a Source with its token, then shows the list again.
 * @example
 * await remove(tramlo);
 */
async function remove(source: SourceView): Promise<void> {
  await window.settings.remove(source.id);
  await reload();
}

/**
 * Closes the form and shows the list.
 * @example
 * close();
 */
function close(): void {
  editing = null;
  render();
}

/**
 * Reads the Sources again and redraws the list.
 * @example
 * await reload();
 */
async function reload(): Promise<void> {
  snapshot = await window.settings.load();

  if (editing === null) render();
}

window.settings.onChanged((next) => {
  snapshot = next;

  // The form is left alone while the person types; the list shows each Source's state as it changes.
  if (editing === null) render();
});

render();
