import { LANGUAGE_CHOICES, type LanguageChoice } from '../../../shared/preferences.ts';
import type { SettingsSnapshot } from '../../../shared/settings-snapshot.ts';
import { popup } from '../controls/popup.ts';
import { row } from '../controls/row.ts';
import { toggle } from '../controls/toggle.ts';
import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import type { WindowActions } from '../window-view.ts';

/** Each language named in itself. */
const LANGUAGE_NAMES = { fr: 'Français', en: 'English' } as const;

/**
 * Returns the general options: the display language, the Mac's own first and named, and opening at login, with
 * what macOS still waits for when it does. The switch then shows what macOS answers, not what was clicked.
 * @example
 * generalGroup(snapshot, actions); // "Language [The Mac’s own (English)]", "Open Deskorama at login [on]"
 */
export function generalGroup(
  snapshot: SettingsSnapshot,
  actions: Pick<WindowActions, 'setPreferences' | 'setOpenAtLogin'>,
): HTMLElement {
  const text = SETTINGS_TEXT[snapshot.lang];
  const { wallpaper } = snapshot;

  const names: Readonly<Record<LanguageChoice, string>> = {
    system: text.macLanguage(LANGUAGE_NAMES[snapshot.systemLang]),
    ...LANGUAGE_NAMES,
  };

  const languages = LANGUAGE_CHOICES.map((choice) => ({ value: choice, label: names[choice] }));

  const language = popup(text.language, languages, wallpaper.language, (chosen) =>
    actions.setPreferences({ language: chosen }),
  );

  const login = toggle(text.openAtLogin, wallpaper.login.on, actions.setOpenAtLogin);

  return element('div', { className: 'group' }, [
    row(text.language, null, [language]),
    row(text.openAtLogin, wallpaper.login.needsApproval ? text.needsApproval : null, [login]),
  ]);
}
