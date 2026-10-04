import type { MenuItemConstructorOptions } from 'electron';
import { describe, expect, test } from 'vitest';
import type { LatestRelease } from '../src/main/fetch-latest-release.ts';
import { trayMenu, type TrayState } from '../src/main/tray-menu.ts';
import { TRAY_TEXT } from '../src/main/tray-text.ts';

const RELEASE: LatestRelease = { tag: 'v0.3.0', url: 'https://github.com/samuelbelolo/deskorama/releases/tag/v0.3.0' };

/** The menu of a fresh launch: the Local webhook listening, nothing failing, L'Aéroport playing. */
const STATE: TrayState = {
  port: 47_213,
  listening: true,
  newRelease: null,
  failing: [],
  theme: 'aeroport',
  paused: false,
};

/** Actions that do nothing, for tests that only read the items. */
const NO_ACTIONS = {
  copyTestCommand: () => {},
  togglePause: () => {},
  chooseTheme: () => {},
  openSettings: () => {},
  openNewRelease: () => {},
  quit: () => {},
};

/**
 * Returns the menu's items for `state`, with actions that record what was opened, paused or chosen.
 * @example
 * menu(STATE).labels;
 * // ['Pause', 'Theme', '—', 'Local webhook on 127.0.0.1:47213', …]
 */
function menu(
  state: TrayState,
  lang: 'fr' | 'en' = 'en',
): {
  items: MenuItemConstructorOptions[];
  labels: string[];
  click: (label: string) => void;
  opened: string[];
} {
  const opened: string[] = [];

  const actions = {
    ...NO_ACTIONS,
    togglePause: () => void opened.push('pause'),
    chooseTheme: (theme: string) => void opened.push(theme),
    openSettings: () => void opened.push('settings'),
    openNewRelease: (release: LatestRelease) => void opened.push(release.url),
  };

  const items = trayMenu(state, TRAY_TEXT[lang], actions);

  return {
    items,
    labels: items.map((item) => item.label ?? '—'),
    // Electron passes the menu item, the window and the event; these items read none of them.
    click: (label) => {
      const click = items.find((item) => item.label === label)?.click;

      if (click !== undefined) Reflect.apply(click, undefined, []);
    },
    opened,
  };
}

describe('the menu-bar menu', () => {
  test('offers pause, the Theme, where the Local webhook listens, a test command to copy, and quit', () => {
    expect(menu(STATE).labels).toEqual([
      'Pause',
      'Theme',
      '—',
      'Local webhook on 127.0.0.1:47213',
      'Copy a test command',
      'Settings…',
      '—',
      'Quit Deskorama',
    ]);
  });

  test('offers a newer release once one is published, in the display language, and opens its page', () => {
    expect(menu({ ...STATE, newRelease: RELEASE }, 'fr').labels).toContain('Télécharger la version 0.3.0…');

    const english = menu({ ...STATE, newRelease: RELEASE });
    english.click('Download version 0.3.0…');

    expect(english.opened).toEqual([RELEASE.url]);
  });

  test('says when the Local webhook could not listen, and offers no command for it', () => {
    const items = trayMenu({ ...STATE, listening: false }, TRAY_TEXT.en, NO_ACTIONS);

    const webhook = items.findIndex((item) => item.label === 'Local webhook off: port 47213 is taken');

    expect(webhook).toBeGreaterThan(-1);
    expect(items[webhook + 1]?.label).toBe('Copy a test command');
    expect(items[webhook + 1]?.enabled).toBe(false);
  });

  test('names each failing Source and what to fix first, and opens the settings from it', () => {
    const failing = [{ name: 'Tramlo', failure: { kind: 'permission', permission: 'read:events' } } as const];
    const english = menu({ ...STATE, failing });

    expect(english.labels.slice(0, 2)).toEqual(['⚠ Tramlo: The token lacks the “read:events” permission.', '—']);

    english.click(english.labels[0] ?? '');
    expect(english.opened).toEqual(['settings']);

    expect(menu({ ...STATE, failing }, 'fr').labels[0]).toBe(
      '⚠ Tramlo : Il manque la permission « read:events » au jeton.',
    );
  });

  test('pauses in one click, ticked while the wallpaper is paused', () => {
    const playing = menu(STATE);

    playing.click('Pause');

    expect(playing.opened).toEqual(['pause']);
    expect(playing.items[0]).toMatchObject({ type: 'checkbox', checked: false });
    expect(menu({ ...STATE, paused: true }, 'fr').items[0]).toMatchObject({ label: 'Mettre en pause', checked: true });
  });

  test('switches the Theme, with the one drawn now checked', () => {
    const { items, opened } = menu(STATE);
    const submenu = items.find((item) => item.label === 'Theme')?.submenu;
    const themes = Array.isArray(submenu) ? submenu : [];

    // Electron enables an item unless it says otherwise.
    expect(themes.map(({ label, checked, enabled }) => ({ label, checked, enabled: enabled !== false }))).toEqual([
      { label: 'L’Aéroport', checked: true, enabled: true },
      { label: 'L’Immeuble', checked: false, enabled: true },
    ]);

    const click = themes[1]?.click;

    if (click !== undefined) Reflect.apply(click, undefined, []);

    expect(opened).toEqual(['immeuble']);
  });
});
