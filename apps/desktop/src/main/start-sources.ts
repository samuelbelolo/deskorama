import type { Clock, GaugeValues, Language, SourceEvent } from '@deskorama/core';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { connectorFetch } from './connector-fetch.ts';
import { CONNECTORS } from './connectors.ts';
import { readSettingsFile } from './read-settings-file.ts';
import { settingsPath } from './settings-path.ts';
import { createSettingsService, type SettingsService } from './settings-window/create-settings-service.ts';
import { createCursorFile } from './sources/create-cursor-file.ts';
import { createKeychain } from './sources/create-keychain.ts';
import { createSourceRuntime, type SourceState } from './sources/create-source-runtime.ts';
import { readSources } from './sources/read-sources.ts';
import { withSources } from './sources/with-sources.ts';
import { writeFileAtomically } from './write-file-atomically.ts';

/** The connected Sources, running, and what the settings window does with them. */
export interface RunningSources {
  /** Polls every Source at once, after the Mac wakes. */
  readonly pollAll: () => void;
  /** Adds, tests, edits and removes Sources for the settings window. */
  readonly service: SettingsService;
  readonly stop: () => void;
}

/** What the running Sources report to, and the display language their tests answer in. */
export interface SourcesOptions {
  readonly clock: Clock;
  readonly userData: string;
  readonly lang: () => Language;
  /** Receives each new Event once, whatever its Source replays, with the id of its Source. */
  readonly onEvent: (event: SourceEvent, sourceId: string) => void;
  /** Receives the Gauge values a Source reported, with the id of that Source. */
  readonly onGauges: (sourceId: string, gauges: Partial<GaugeValues>) => void;
  /** Receives every Source's state whenever one changes, for the menu bar and the settings window. */
  readonly onStates: (states: readonly SourceState[]) => void;
}

/**
 * Starts polling the Sources saved in `settings.json` with their tokens from the Keychain, and returns the service
 * the settings window uses to change them. Events, Gauge values and states go to the callbacks.
 * @example
 * const sources = startSources({ clock, userData, lang: scene.lang, onEvent: send, onGauges: scene.setGauges,
 *   onStates: (states) => tray.update(…) });
 * sources.service.snapshot().sources.length; // the Sources saved in settings.json
 * powerMonitor.on('resume', sources.pollAll);
 */
export function startSources(options: SourcesOptions): RunningSources {
  const { clock, userData } = options;

  const tokens = createKeychain('source:');
  const cursors = createCursorFile(join(userData, 'cursors.json'));

  const runtime = createSourceRuntime({
    connectors: CONNECTORS,
    clock,
    fetch: connectorFetch,
    tokens,
    cursors,
    onEvent: options.onEvent,
    onGauges: options.onGauges,
    onStates: options.onStates,
  });

  const service = createSettingsService({
    lang: options.lang,
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

  runtime.load(readSources(readSettingsFile(userData)));

  return {
    pollAll: () => runtime.pollAll(),
    service,
    stop: () => runtime.stop(),
  };
}
