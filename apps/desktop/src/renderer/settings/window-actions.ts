import type { Clock } from '@deskorama/core';
import type { SettingsBridge } from '../../shared/settings-bridge.ts';
import type { ConnectorView, LoginItemState } from '../../shared/settings-snapshot.ts';
import { confirmSheet, type ConfirmWords } from './confirm-sheet.ts';
import type { PaneId } from './pane-id.ts';
import { connectionSheet } from './sheet/connection-sheet.ts';
import type { SheetStart } from './sheet/sheet-start.ts';
import type { SheetLayer } from './sheet-layer.ts';
import { SETTINGS_TEXT } from './text/text-by-language.ts';
import type { WindowActions, WindowView } from './window-view.ts';

/** What the window's actions work with. */
export interface WindowContext {
  readonly bridge: SettingsBridge;
  /** The window's Clock, which the connection sheet times its loadings on. */
  readonly clock: Clock;
  readonly sheets: SheetLayer;
  /** What the window shows now. */
  readonly view: () => WindowView;
  /** Changes part of what the window shows, then draws it again. */
  readonly show: (change: Partial<WindowView>) => void;
  /** Changes part of what the window shows without drawing it: the next drawing shows it. */
  readonly remember: (change: Partial<WindowView>) => void;
  /** Reads the snapshot again from the main process, then draws the window. */
  readonly reload: () => Promise<void>;
  /** Visits a pane, remembered by the toolbar's arrows. */
  readonly visit: (pane: PaneId) => void;
}

/**
 * Returns what the panes may ask of the window: moving between panes, opening the connection sheet on a new Source
 * or a connected one, removing a Source or drawing a new secret after asking once more, changing the wallpaper's
 * setup, the login item or the Local webhook, and what only the window remembers (day or night, the secret shown,
 * the last test played). A request the main process refuses redraws the window as it stands; a new secret that
 * could not be drawn is also said, since the pane would otherwise look as after a success.
 * @example
 * const actions = windowActions({ bridge, clock, sheets, view: () => view, show, remember, reload, visit });
 * actions.connect(github); // the GitHub sheet drops from the title bar
 */
export function windowActions(context: WindowContext): WindowActions {
  const { bridge, show } = context;

  const text = () => SETTINGS_TEXT[context.view().snapshot.lang];
  const redraw = (): void => show({});
  const { openSheet, askThen } = sheetRequests(context, redraw);

  /** Shows what macOS answers about the login item, in place of what the snapshot held. */
  const showLogin = (login: LoginItemState): void => {
    const { snapshot } = context.view();

    show({ snapshot: { ...snapshot, wallpaper: { ...snapshot.wallpaper, login } } });
  };

  return {
    go: context.visit,

    connect: (connector) => openSheet(connector, { id: null, name: '', values: {}, interval: null }),

    edit(source) {
      const connector = context.view().snapshot.connectors.find((candidate) => candidate.id === source.connector);
      const { id, name, values, lists, interval } = source;

      if (connector !== undefined) openSheet(connector, { id, name, values, lists, interval });
    },

    remove(source) {
      const { removeTitle, removeBody, remove, cancel } = text();
      const words = { title: removeTitle(source.name), body: removeBody, confirm: remove, cancel };

      askThen(words, () => bridge.remove(source.id).then(context.reload));
    },

    setPreferences: (change) => void bridge.setPreferences(change).catch(redraw),
    setOpenAtLogin: (on) => void bridge.setOpenAtLogin(on).then(showLogin).catch(redraw),
    setTime: (time) => show({ time }),
    setWebhookOn: (on) => void bridge.setWebhookOn(on).catch(redraw),

    toggleSecret() {
      if (context.view().secret !== null) return show({ secret: null });

      void bridge
        .revealSecret()
        .then((secret) => show({ secret }))
        .catch(redraw);
    },

    regenerateSecret() {
      const { regenerateTitle, regenerateBody, regenerateConfirm, cancel } = text();
      const words = { title: regenerateTitle, body: regenerateBody, confirm: regenerateConfirm, cancel };

      // A secret left on screen would be the old one: it is masked again. A refusal leaves the old secret in force.
      askThen(words, () =>
        bridge.regenerateSecret().then(
          () => show({ secret: null, regenerateFailed: false }),
          () => show({ regenerateFailed: true }),
        ),
      );
    },

    setPlayed: (played) => context.remember({ played }),
  };
}

/** The two ways the window asks through a sheet. */
interface SheetRequests {
  /** Opens the connection sheet of a Connector on `start`; once saved, the Sources pane shows the result. */
  readonly openSheet: (connector: ConnectorView, start: SheetStart) => void;
  /** Asks once more with `words`, then runs `request` and what follows it. */
  readonly askThen: (words: ConfirmWords, request: () => Promise<void>) => void;
}

/**
 * Returns the two ways the window asks through a sheet: the connection sheet of a Connector, and a confirmation
 * before something that cannot be undone. `redraw` runs when the main process refuses what follows.
 * @example
 * const { askThen } = sheetRequests(context, redraw);
 * askThen(words, () => bridge.remove('src-kit')); // "Remove Tramlo Kit?" drops from the title bar
 */
function sheetRequests(context: WindowContext, redraw: () => void): SheetRequests {
  const { bridge, clock, sheets } = context;
  const hide = (): void => sheets.hide();

  return {
    openSheet(connector, start) {
      const onSaved = (): void => {
        sheets.hide();
        context.visit('sources');

        void context.reload().catch(redraw);
      };

      const { lang } = context.view().snapshot;

      sheets.show(connectionSheet({ connector, start, lang, bridge, clock, onSaved, onCancel: hide }), hide);
    },

    askThen(words, request) {
      const confirm = (): void => {
        sheets.hide();

        void request().catch(redraw);
      };

      sheets.show(confirmSheet(words, { confirm, cancel: hide }), hide);
    },
  };
}
