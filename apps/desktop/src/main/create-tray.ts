import type { Language } from '@deskorama/core';
import { Menu, Tray } from 'electron';
import { createTrayIcon } from './create-tray-icon.ts';
import { trayMenu, type TrayActions, type TrayState } from './tray-menu.ts';
import { TRAY_TEXT } from './tray-text.ts';

/** The menu-bar icon and its menu. */
export interface AppTray {
  /** Rebuilds the menu with part of its state changed. */
  update(change: Partial<TrayState>): void;
  /** Removes the icon from the menu bar. */
  destroy(): void;
}

/**
 * Puts the app's icon in the menu bar, with its menu in the display language.
 * @example
 * const tray = createTray('en', { port: 47213, listening: true, newRelease: null, failing: [] }, actions);
 * tray.update({ newRelease }); // the menu now offers "Download version 0.3.0…"
 */
export function createTray(lang: Language, initial: TrayState, actions: TrayActions): AppTray {
  const text = TRAY_TEXT[lang];
  const tray = new Tray(createTrayIcon());

  tray.setToolTip(text.tooltip);

  let state = initial;
  const render = (): void => tray.setContextMenu(Menu.buildFromTemplate(trayMenu(state, text, actions)));

  render();

  return {
    update(change) {
      state = { ...state, ...change };

      render();
    },
    destroy: () => tray.destroy(),
  };
}
