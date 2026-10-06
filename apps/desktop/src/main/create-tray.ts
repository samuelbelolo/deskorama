import type { Language } from '@deskorama/core';
import { Menu, Tray } from 'electron';
import { createTrayIcon } from './create-tray-icon.ts';
import { trayMenu, type TrayActions, type TrayState } from './tray-menu.ts';
import { TRAY_TEXT } from './tray-text.ts';

/** What the menu-bar icon shows: its menu's state, in a display language. */
export interface TrayView extends TrayState {
  readonly lang: Language;
}

/** The menu-bar icon and its menu. */
export interface AppTray {
  /** Rebuilds the menu with part of its state, or its language, changed; nothing once the icon is removed. */
  update(change: Partial<TrayView>): void;
  /** Removes the icon from the menu bar. */
  destroy(): void;
}

/**
 * Puts the app's icon in the menu bar, with its menu in the display language.
 * @example
 * const tray = createTray({ lang: 'en', port: 47213, listening: true, newRelease: null,
 *   releaseCheck: 'ready', failing: [], theme: 'aeroport', paused: false }, actions);
 * tray.update({ paused: true }); // "Pause" is now ticked
 */
export function createTray(initial: TrayView, actions: TrayActions): AppTray {
  const tray = new Tray(createTrayIcon());

  let view = initial;
  let destroyed = false;

  const render = (): void => {
    const text = TRAY_TEXT[view.lang];

    tray.setToolTip(text.tooltip);
    tray.setContextMenu(Menu.buildFromTemplate(trayMenu(view, text, actions)));
  };

  render();

  return {
    update(change) {
      // An answer that comes back while the app quits finds no menu to redraw.
      if (destroyed) return;

      view = { ...view, ...change };

      render();
    },
    destroy() {
      destroyed = true;
      tray.destroy();
    },
  };
}
