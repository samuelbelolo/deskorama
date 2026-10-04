import { GAUGE_ROLES } from '@deskorama/core';
import { LANGUAGE_CHOICES, type PreferencesChange } from '../../shared/preferences.ts';
import type { SettingsSnapshot } from '../../shared/settings-bridge.ts';
import { AVAILABLE_THEMES, THEME_CHOICES } from '../../shared/theme-choice.ts';
import { element } from './element.ts';
import { labelledSelect } from './labelled-select.ts';
import { SETTINGS_TEXT } from './settings-text.ts';

/** What the panel's controls do. */
export interface WallpaperPanelActions {
  readonly setPreferences: (change: PreferencesChange) => void;
  readonly setOpenAtLogin: (on: boolean) => void;
}

/**
 * Returns the panel that sets up the wallpaper: the Theme (one the app does not ship yet is greyed out), the
 * language, opening at login, and, once several Sources are connected, the Source that names the scene and the one
 * that feeds each Gauge. Each change applies at once.
 * @example
 * root.append(renderWallpaperPanel(snapshot, { setPreferences, setOpenAtLogin })); // the "Wallpaper" panel
 */
export function renderWallpaperPanel(snapshot: SettingsSnapshot, actions: WallpaperPanelActions): HTMLElement {
  const text = SETTINGS_TEXT[snapshot.lang];
  const { wallpaper, sources } = snapshot;

  const themeOptions = THEME_CHOICES.map((choice) => ({
    value: choice.id,
    label: choice.available ? choice.name : text.comingSoon(choice.name),
    disabled: !choice.available,
  }));

  const theme = labelledSelect('theme', text.theme, themeOptions, wallpaper.theme);

  theme.field.addEventListener('change', () => {
    const chosen = AVAILABLE_THEMES.find((id) => id === theme.field.value);

    if (chosen !== undefined) actions.setPreferences({ theme: chosen });
  });

  // Each language is named in itself; the Mac's own is named in the display language.
  const languageNames = { system: text.systemLanguage, fr: 'Français', en: 'English' };
  const languageOptions = LANGUAGE_CHOICES.map((choice) => ({ value: choice, label: languageNames[choice] }));
  const language = labelledSelect('language', text.language, languageOptions, wallpaper.language);

  language.field.addEventListener('change', () => {
    const chosen = LANGUAGE_CHOICES.find((choice) => choice === language.field.value);

    if (chosen !== undefined) actions.setPreferences({ language: chosen });
  });

  const login = element('input', { attributes: { id: 'field-login', type: 'checkbox' } });

  login.checked = wallpaper.login.on;
  login.addEventListener('change', () => actions.setOpenAtLogin(login.checked));

  const approval = wallpaper.login.needsApproval ? [element('p', { className: 'hint', text: text.needsApproval })] : [];

  const loginRow = element('div', { className: 'check' }, [
    login,
    element('label', { text: text.openAtLogin, attributes: { for: 'field-login' } }),
  ]);

  return element('section', { className: 'panel' }, [
    element('h2', { text: text.wallpaper }),
    ...theme.nodes,
    ...language.nodes,
    ...(sources.length < 2 ? [] : sourceChoices(snapshot, actions)),
    loginRow,
    ...approval,
  ]);
}

/**
 * Returns the selects of the Source that names the scene and of the one that feeds each Gauge: a Gauge follows the
 * Source naming the scene unless the person picks another for it.
 * @example
 * panel.append(...sourceChoices(snapshot, actions)); // a label and a select for the brand, then for each Gauge
 */
function sourceChoices(snapshot: SettingsSnapshot, actions: WallpaperPanelActions): HTMLElement[] {
  const text = SETTINGS_TEXT[snapshot.lang];
  const { wallpaper } = snapshot;

  const options = snapshot.sources.map((source) => ({ value: source.id, label: source.name }));

  const brand = labelledSelect('brand', text.brand, options, wallpaper.brand ?? '');

  brand.field.addEventListener('change', () => actions.setPreferences({ brand: brand.field.value }));

  const gaugeOptions = [{ value: '', label: text.sameAsBrand }, ...options];

  const gauges = GAUGE_ROLES.flatMap((role) => {
    const select = labelledSelect(`gauge-${role}`, text.gauges[role], gaugeOptions, wallpaper.gauges[role] ?? '');

    select.field.addEventListener('change', () =>
      actions.setPreferences({ gauges: { [role]: select.field.value === '' ? null : select.field.value } }),
    );

    return select.nodes;
  });

  return [...brand.nodes, ...gauges];
}
