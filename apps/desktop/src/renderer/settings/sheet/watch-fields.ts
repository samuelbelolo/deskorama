import type { Clock, Language } from '@deskorama/core';
import type { SettingsBridge } from '../../../shared/settings-bridge.ts';
import type { ConnectorView } from '../../../shared/settings-snapshot.ts';
import { createPicksLoader, type PicksLoaderOptions } from './picks-loader.ts';

/** What keeps a connection sheet in step with its fields. */
export interface WatchFieldsOptions {
  /** The sheet, which hears every change of its fields as an `input`. */
  readonly sheet: HTMLElement;
  readonly connector: ConnectorView;
  readonly form: PicksLoaderOptions['form'];
  readonly bridge: Pick<SettingsBridge, 'listOptions'>;
  /** Times the wait before a list is loaded, so typing does not ask at every key. */
  readonly clock: Clock;
  readonly lang: Language;
  /** Draws what follows from the fields: the steps done, and whether a test or a save can be asked. */
  readonly refresh: () => void;
}

/**
 * Keeps a connection sheet in step with its fields, from now on: at each change of one, the lists that depend on
 * it load again, then what follows from the fields is drawn. A list that loads counts as a change, since it may
 * reword what its field holds, which the lists that need that field are then asked with.
 * @example
 * watchFields({ sheet, connector: sentry, form, bridge, clock, lang: 'en', refresh });
 * // the projects load once an organization is chosen, and `refresh` checks the step once one is ticked
 */
export function watchFields(options: WatchFieldsOptions): void {
  const { sheet, refresh, ...loading } = options;

  const loader = createPicksLoader({ ...loading, onLoaded: () => changed() });

  /** Takes a change of a field: the lists that depend on it load again, then what follows from the fields is drawn. */
  const changed = (): void => {
    loader.sync();
    refresh();
  };

  sheet.addEventListener('input', changed);
  changed();
}
