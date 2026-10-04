// The settings window: sets up the wallpaper, lists the connected Sources (added, tested, edited and removed here)
// and plays test Events, through `window.settings`, the only way this sandboxed page reaches the main process.
import './settings.css';
import type { SettingsSnapshot, SourceView } from '../../shared/settings-bridge.ts';
import { element } from './element.ts';
import { renderSourceForm, type FormStart } from './render-source-form.ts';
import { renderSourceList } from './render-source-list.ts';
import { renderTestPanel } from './render-test-panel.ts';
import { renderWallpaperPanel } from './render-wallpaper-panel.ts';
import { SETTINGS_TEXT } from './settings-text.ts';

const root = document.querySelector<HTMLElement>('#settings');

if (root === null) throw new Error('The settings page lacks #settings.');

let snapshot: SettingsSnapshot = await window.settings.load();
let editing: { readonly connector: string; readonly start: FormStart } | null = null;

/**
 * Draws the window in the display language: the title, then the form while a Source is added or edited, else the
 * wallpaper's setup, the Sources and the test Events.
 * @example
 * render();
 */
function render(): void {
  const { lang } = snapshot;
  const text = SETTINGS_TEXT[lang];

  document.documentElement.lang = lang;
  document.title = text.windowTitle;

  const header = element('h1', { text: text.title });

  const connector = snapshot.connectors.find((candidate) => candidate.id === editing?.connector);

  if (editing === null || connector === undefined) {
    root?.replaceChildren(
      header,
      renderWallpaperPanel(snapshot, {
        setPreferences: (change) => void window.settings.setPreferences(change).catch(render),
        setOpenAtLogin: (on) => void openAtLogin(on).catch(render),
      }),
      renderSourceList(snapshot, lang, { add, edit, remove: (source) => void remove(source).catch(render) }),
      renderTestPanel(lang, (choice) => void window.settings.playTest(choice)),
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

  root?.replaceChildren(header, form);
}

/**
 * Asks macOS to open the app at login, or not, and shows what macOS answers.
 * @example
 * await openAtLogin(true); // the box stays ticked, with a hint if macOS waits for approval
 */
async function openAtLogin(on: boolean): Promise<void> {
  const login = await window.settings.setOpenAtLogin(on);

  snapshot = { ...snapshot, wallpaper: { ...snapshot.wallpaper, login } };

  if (editing === null) render();
}

/**
 * Opens the form for a new Source of one Connector.
 * @example
 * add('feed');
 */
function add(connector: string): void {
  editing = { connector, start: { id: null, name: '', values: {}, interval: null } };
  render();
}

/**
 * Opens the form on a connected Source.
 * @example
 * edit(tramlo);
 */
function edit(source: SourceView): void {
  const { id, name, values, interval } = source;

  editing = { connector: source.connector, start: { id, name, values, interval } };
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

  // The form is left alone while the person types; the rest follows each change as it happens.
  if (editing === null) render();
});

render();
