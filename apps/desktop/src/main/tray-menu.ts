import type { ConnectorFailure } from '@deskorama/core';
import type { MenuItemConstructorOptions } from 'electron';
import { THEME_CHOICES, type ShippedThemeId } from '../shared/theme-choice.ts';
import type { LatestRelease } from './fetch-latest-release.ts';
import type { TrayText } from './tray-text.ts';

/** A Source whose last poll failed, as the menu bar names it. */
interface FailingSource {
  readonly name: string;
  readonly failure: ConnectorFailure;
}

/**
 * Where the check for a newer release stands: off in a local build, ready to be asked, asking GitHub, back with
 * none newer, or back without an answer from GitHub.
 */
export type ReleaseCheck = 'off' | 'ready' | 'checking' | 'none' | 'unreachable';

/** What the menu-bar menu shows. */
export interface TrayState {
  readonly port: number;
  /** False once the person turned the Local webhook off in the settings window. */
  readonly webhookOn: boolean;
  /** False while the Local webhook is off, and when it could not listen on its port. */
  readonly listening: boolean;
  /** A published release newer than the running app, or null. */
  readonly newRelease: LatestRelease | null;
  /** Where the check the person can ask for stands. */
  readonly releaseCheck: ReleaseCheck;
  /** The Sources whose last poll failed, in the settings' order. */
  readonly failing: readonly FailingSource[];
  /** The Theme drawn now. */
  readonly theme: ShippedThemeId;
  /** True while the person paused the wallpaper. */
  readonly paused: boolean;
}

/** What the menu's items do. */
export interface TrayActions {
  readonly copyTestCommand: () => void;
  /** Freezes the wallpaper, or lets it play again. */
  readonly togglePause: () => void;
  readonly chooseTheme: (theme: ShippedThemeId) => void;
  readonly openSettings: () => void;
  /** Opens the new release's page, where the dmg is downloaded. */
  readonly openNewRelease: (release: LatestRelease) => void;
  /** Asks GitHub for a newer release now. */
  readonly checkForRelease: () => void;
  readonly quit: () => void;
}

/**
 * Returns the items of the menu-bar menu: one line per failing Source saying what to fix (it opens the settings),
 * pause in one click (for a screen share), the Theme to draw (one the app does not ship yet is greyed out), the
 * Local webhook's address, a test command to copy, the settings, the new version once one is published or else
 * the check for one, and quit. Quitting closes the wallpaper windows, which gives the system wallpaper back.
 * @example
 * const state = { port: 47213, webhookOn: true, listening: true, newRelease: null, releaseCheck: 'ready',
 *   failing: [], theme: 'aeroport', paused: false };
 * Menu.buildFromTemplate(trayMenu(state, TRAY_TEXT.en, actions));
 */
export function trayMenu(state: TrayState, text: TrayText, actions: TrayActions): MenuItemConstructorOptions[] {
  const webhook = webhookLine(state, text);

  const failing: MenuItemConstructorOptions[] = state.failing.map((source) => ({
    label: text.failing(source.name, source.failure),
    click: actions.openSettings,
  }));

  const themes: MenuItemConstructorOptions[] = THEME_CHOICES.map((choice) =>
    choice.available
      ? {
          label: choice.name,
          type: 'radio',
          checked: choice.id === state.theme,
          click: () => actions.chooseTheme(choice.id),
        }
      : { label: text.comingSoon(choice.name), type: 'radio', checked: false, enabled: false },
  );

  return [
    ...failing,
    ...(failing.length === 0 ? [] : [{ type: 'separator' } as const]),
    { label: text.pause, type: 'checkbox', checked: state.paused, click: actions.togglePause },
    { label: text.theme, submenu: themes },
    { type: 'separator' },
    { label: webhook, enabled: false },
    { label: text.copyTestCommand, enabled: state.listening, click: actions.copyTestCommand },
    { label: text.settings, accelerator: 'Command+,', click: actions.openSettings },
    ...releaseItems(state, text, actions),
    { type: 'separator' },
    { label: text.quit, accelerator: 'Command+Q', click: actions.quit },
  ];
}

/**
 * Returns the line that says where the Local webhook stands: listening, turned off by the person, or stopped
 * because its port was taken.
 * @example
 * webhookLine({ ...state, webhookOn: false, listening: false }, TRAY_TEXT.en); // 'Local webhook turned off'
 */
function webhookLine(state: TrayState, text: TrayText): string {
  if (!state.webhookOn) return text.webhookDisabled;

  return state.listening ? text.listening(state.port) : text.webhookOff(state.port);
}

/**
 * Returns the line about a newer release: its download once one is known, else the check for one, greyed out while
 * GitHub is being asked, and saying what the last check came back with; nothing in a local build.
 * @example
 * releaseItems({ ...state, releaseCheck: 'ready' }, TRAY_TEXT.en, actions)[0]?.label; // 'Check for updates'
 * releaseItems({ ...state, newRelease: release }, TRAY_TEXT.en, actions)[0]?.label; // 'Download version 0.3.0…'
 */
function releaseItems(state: TrayState, text: TrayText, actions: TrayActions): MenuItemConstructorOptions[] {
  const release = state.newRelease;

  if (release !== null) return [{ label: text.newRelease(release.tag), click: () => actions.openNewRelease(release) }];

  if (state.releaseCheck === 'off') return [];
  if (state.releaseCheck === 'checking') return [{ label: text.checkingForRelease, enabled: false }];

  const labels = { ready: text.checkForRelease, none: text.noNewRelease, unreachable: text.releaseUnreachable };

  return [{ label: labels[state.releaseCheck], click: actions.checkForRelease }];
}
