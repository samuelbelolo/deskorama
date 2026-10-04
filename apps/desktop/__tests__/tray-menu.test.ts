import { describe, expect, test } from 'vitest';
import type { LatestRelease } from '../src/main/fetch-latest-release.ts';
import { trayMenu, type TrayState } from '../src/main/tray-menu.ts';
import { TRAY_TEXT } from '../src/main/tray-text.ts';

const RELEASE: LatestRelease = { tag: 'v0.3.0', url: 'https://github.com/samuelbelolo/deskorama/releases/tag/v0.3.0' };

/**
 * Returns the menu's items for `state`, with actions that record which release page was opened.
 * @example
 * menu({ port: 47213, listening: true, newRelease: null, failing: [] }).labels;
 * // ['Local webhook on 127.0.0.1:47213', …]
 */
function menu(
  state: TrayState,
  lang: 'fr' | 'en' = 'en',
): { labels: string[]; click: (label: string) => void; opened: string[] } {
  const opened: string[] = [];

  const actions = {
    copyTestCommand: () => {},
    openSettings: () => void opened.push('settings'),
    openNewRelease: (release: LatestRelease) => void opened.push(release.url),
    quit: () => {},
  };

  const items = trayMenu(state, TRAY_TEXT[lang], actions);

  return {
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
  test('shows where the Local webhook listens, a test command to copy, and quit', () => {
    expect(menu({ port: 47_213, listening: true, newRelease: null, failing: [] }).labels).toEqual([
      'Local webhook on 127.0.0.1:47213',
      'Copy a test command',
      'Settings…',
      '—',
      'Quit Deskorama',
    ]);
  });

  test('offers a newer release once one is published, in the display language, and opens its page', () => {
    expect(menu({ port: 47_213, listening: true, newRelease: RELEASE, failing: [] }, 'fr').labels).toContain(
      'Télécharger la version 0.3.0…',
    );

    const english = menu({ port: 47_213, listening: true, newRelease: RELEASE, failing: [] });
    english.click('Download version 0.3.0…');

    expect(english.opened).toEqual([RELEASE.url]);
  });

  test('says when the Local webhook could not listen, and offers no command for it', () => {
    const items = trayMenu({ port: 47_213, listening: false, newRelease: null, failing: [] }, TRAY_TEXT.en, {
      copyTestCommand: () => {},
      openSettings: () => {},
      openNewRelease: () => {},
      quit: () => {},
    });

    expect(items[0]?.label).toBe('Local webhook off: port 47213 is taken');
    expect(items[1]?.enabled).toBe(false);
  });

  test('names each failing Source and what to fix first, and opens the settings from it', () => {
    const failing = [{ name: 'Tramlo', failure: { kind: 'permission', permission: 'read:events' } } as const];
    const english = menu({ port: 47_213, listening: true, newRelease: null, failing });

    expect(english.labels.slice(0, 2)).toEqual(['⚠ Tramlo: The token lacks the “read:events” permission.', '—']);

    english.click(english.labels[0] ?? '');
    expect(english.opened).toEqual(['settings']);

    expect(menu({ port: 47_213, listening: true, newRelease: null, failing }, 'fr').labels[0]).toBe(
      '⚠ Tramlo : Il manque la permission « read:events » au jeton.',
    );
  });
});
