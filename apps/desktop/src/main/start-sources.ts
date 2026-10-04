import type { Clock, Language } from '@deskorama/core';
import type { BrowserWindow } from 'electron';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { SETTINGS_CHANNELS } from '../shared/settings-bridge.ts';
import { toWireEvent } from '../shared/to-wire-event.ts';
import { EVENT_CHANNEL } from '../shared/wallpaper-bridge.ts';
import { connectorFetch } from './connector-fetch.ts';
import { CONNECTORS } from './connectors.ts';
import { readSettingsFile } from './read-settings-file.ts';
import { sendToWindows } from './send-to-windows.ts';
import { settingsPath } from './settings-path.ts';
import { createSettingsService } from './settings-window/create-settings-service.ts';
import { openSettingsWindow } from './settings-window/open-settings-window.ts';
import { registerSettingsIpc } from './settings-window/register-settings-ipc.ts';
import { createCursorFile } from './sources/create-cursor-file.ts';
import { createKeychain } from './sources/create-keychain.ts';
import { createSourceRuntime, type SourceState } from './sources/create-source-runtime.ts';
import { readSources } from './sources/read-sources.ts';
import { withSources } from './sources/with-sources.ts';
import { writeFileAtomically } from './write-file-atomically.ts';

/** The connected Sources, running, and the settings window that manages them. */
export interface RunningSources {
  /** Polls every Source at once, after the Mac wakes. */
  readonly pollAll: () => void;
  readonly openSettings: () => void;
  readonly stop: () => void;
}

/**
 * Starts polling the Sources saved in `settings.json` with their tokens from the Keychain, sends their Events and
 * Gauges to every wallpaper window, and answers the settings window. `onStates` hears every Source's state, for
 * the menu bar.
 * @example
 * const sources = startSources({ windows, clock, lang, userData, onStates: (states) => tray.update(…) });
 * powerMonitor.on('resume', sources.pollAll);
 */
export function startSources(options: {
  readonly windows: readonly BrowserWindow[];
  readonly clock: Clock;
  readonly lang: Language;
  readonly userData: string;
  readonly onStates: (states: readonly SourceState[]) => void;
}): RunningSources {
  const { windows, clock, lang, userData } = options;

  const tokens = createKeychain('source:');
  const cursors = createCursorFile(join(userData, 'cursors.json'));
  let settingsWindow: BrowserWindow | null = null;

  const runtime = createSourceRuntime({
    connectors: CONNECTORS,
    clock,
    fetch: connectorFetch,
    tokens,
    cursors,
    // Every screen plays every Event for now; routing to the most visible screen comes later.
    onEvent: (event) => sendToWindows(windows, EVENT_CHANNEL, toWireEvent(event)),
    // The scene's Gauges keep the words of the Source that names it; which Source feeds them is chosen in the
    // settings, which comes later, so the values a Source reports are not shown under another Source's words.
    onGauges: () => {},
    onStates: (states) => {
      options.onStates(states);

      if (settingsWindow !== null && !settingsWindow.isDestroyed()) {
        settingsWindow.webContents.send(SETTINGS_CHANNELS.changed, service.snapshot());
      }
    },
  });

  const service = createSettingsService({
    lang,
    connectors: CONNECTORS,
    runtime,
    tokens,
    cursors,
    clock,
    fetch: connectorFetch,
    readSources: () => readSources(readSettingsFile(userData)),
    writeSources: (sources) =>
      writeFileAtomically(settingsPath(userData), withSources(readSettingsFile(userData), sources)),
    newId: () => randomUUID(),
  });

  const unregister = registerSettingsIpc(service, () => settingsWindow);

  runtime.load(readSources(readSettingsFile(userData)));

  return {
    pollAll: () => runtime.pollAll(),
    openSettings() {
      const opened = openSettingsWindow(lang, settingsWindow);

      if (opened === settingsWindow) return;

      settingsWindow = opened;
      opened.once('closed', () => (settingsWindow = null));
    },
    stop() {
      runtime.stop();
      unregister();
    },
  };
}
