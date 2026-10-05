import type { Cancel, Clock, ConnectorFailure, ConnectorOption, Language } from '@deskorama/core';
import type { SettingsBridge } from '../../../shared/settings-bridge.ts';
import type { ConnectorView } from '../../../shared/settings-snapshot.ts';
import type { SourceDraft } from '../../../shared/source-draft.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import type { PickField } from './pick-field.ts';

/** How long the fields must stay still before a list is asked for, so typing does not ask at every key. */
const SETTLE_MS = 350;

/** How long a list waits before it is asked again when the service could not be reached; doubled at each failure. */
const RETRY_MS = 4000;

/** The longest a list waits between two tries, however many failed. */
const MAX_RETRY_MS = 60_000;

/** What the loader reads of the sheet's form. */
interface PicksForm {
  readonly picks: readonly PickField[];
  readonly token: HTMLInputElement;
  readonly hasToken: () => boolean;
  readonly values: () => Record<string, string>;
  readonly draft: () => SourceDraft;
}

/** What loads the lists of a connection sheet. */
export interface PicksLoaderOptions {
  readonly connector: ConnectorView;
  readonly form: PicksForm;
  readonly bridge: Pick<SettingsBridge, 'listOptions'>;
  readonly clock: Clock;
  readonly lang: Language;
  /** Called once a list is drawn, since what the form holds may have changed with it. */
  readonly onLoaded: () => void;
}

/** Keeps the lists of a connection sheet in step with its token and fields. */
export interface PicksLoader {
  /** Looks at the token and the fields again, and loads the lists whose needs changed. */
  readonly sync: () => void;
}

/** What one list was last asked with. */
interface Asked {
  /** The token and the needed values of the last request, as one string. */
  request?: string;
  /** The needed values alone, once they were all there; forgotten when a list only rewords one of them. */
  needs?: string | undefined;
  /** Stops what the list waits for: the fields to settle, or the next try after a failure. */
  cancel?: Cancel;
  /** Counts the requests, so a late answer to an earlier one is ignored. */
  turn: number;
  /** The kind of the failure last drawn for this request, so that trying again never draws the same line twice. */
  failed?: ConnectorFailure['kind'] | undefined;
  /** How many times in a row the service could not be reached for this request. */
  unreached: number;
}

/** One list of a sheet, with what it was last asked with and what every list of the sheet was. */
interface PickLoad {
  readonly pick: PickField;
  readonly state: Asked;
  /** What each list of the sheet was last asked with, by the key of its field. */
  readonly asked: ReadonlyMap<string, Asked>;
}

/**
 * Returns what loads the lists of a connection sheet: each waits for the token, then for the fields it needs, and
 * is asked again, once typing has stopped, whenever one of those changes. A list whose needed fields changed
 * forgets what was picked in it, which belonged to the other organization or project. An answer that comes after
 * a newer request is ignored, and nothing is asked once the sheet is closed. A list the service could not be
 * reached for, or limits the rate of, is asked again by itself.
 * @example
 * const loader = createPicksLoader({ connector: sentry, form, bridge, clock, lang: 'en', onLoaded: refresh });
 * sheet.addEventListener('input', loader.sync); // the projects load once an organization is chosen
 */
export function createPicksLoader(options: PicksLoaderOptions): PicksLoader {
  const asked = new Map<string, Asked>(options.form.picks.map((pick) => [pick.field.key, { turn: 0, unreached: 0 }]));

  return {
    sync() {
      for (const pick of options.form.picks) {
        const state = asked.get(pick.field.key);

        if (state !== undefined) syncPick({ pick, state, asked }, options);
      }
    },
  };
}

/**
 * Brings one list in step with the token and the fields it needs: nothing when neither changed since it was last
 * asked; otherwise it says what it waits for, or shows the loading and asks once the fields have settled.
 * @example
 * syncPick({ pick: projects, state, asked }, options); // "Fill in “Organization” first." until one is chosen
 */
function syncPick(load: PickLoad, options: PicksLoaderOptions): void {
  const { pick, state } = load;
  const { connector, form, lang } = options;
  const text = SETTINGS_TEXT[lang];

  const values = form.values();
  const needed = pick.field.needs.map((key) => [key, (values[key] ?? '').trim()] as const);
  const needs = JSON.stringify(needed);
  const request = JSON.stringify([form.token.value, needs]);

  if (request === state.request) return;

  state.request = request;
  state.cancel?.();
  state.turn += 1;
  state.failed = undefined;
  state.unreached = 0;

  const missing = needed.find(([, value]) => value === '')?.[0];

  // What was picked under another organization or project means nothing under this one.
  if (state.needs !== undefined && state.needs !== needs) pick.clear();

  if (missing === undefined) state.needs = needs;

  if (!form.hasToken()) return pick.show({ kind: 'waiting', note: text.pickNeedsToken });

  if (missing !== undefined) {
    const label = connector.fields.find((field) => field.key === missing)?.label[lang] ?? missing;

    return pick.show({ kind: 'waiting', note: text.pickNeeds(label) });
  }

  const { turn } = state;

  // A sheet closed meanwhile has left the page: its lists are no longer wanted.
  const wanted = (): boolean => state.turn === turn && pick.node.isConnected;

  pick.show({ kind: 'loading' });
  state.cancel = options.clock.after(SETTLE_MS, () => void loadPick(load, wanted, options));
}

/**
 * Asks the main process for the options of one list and draws them, or why the service refused; nothing is asked,
 * and an answer is dropped, once the list is no longer `wanted`, because the fields changed or the sheet closed. A
 * request the main process could not answer reads as an answer nobody can read. After a failure the app waits out
 * by itself (the service unreachable, a rate limit), the list is asked again later; trying again draws the options
 * or another failure only, so a value being typed by hand under the same line stays as it is.
 * @example
 * await loadPick({ pick: projects, state, asked }, () => true, options); // the projects as checkboxes
 */
async function loadPick(load: PickLoad, wanted: () => boolean, options: PicksLoaderOptions): Promise<void> {
  const { pick, state } = load;

  if (!wanted()) return;

  const answer = await options.bridge.listOptions(options.form.draft(), pick.field.key).catch(() => null);

  if (!wanted()) return;

  if (answer !== null && answer.ok) {
    showLoaded(load, answer.options, options.form.picks);
  } else {
    const failure: ConnectorFailure =
      answer === null || 'gone' in answer ? { kind: 'invalid-response' } : answer.failure;

    if (failure.kind !== state.failed) pick.show({ kind: 'failed', failure });

    const wait = retryWait(failure, state.unreached, options.clock.now());

    state.failed = failure.kind;
    state.unreached += failure.kind === 'network' ? 1 : 0;

    if (wait !== null) state.cancel = options.clock.after(wait, () => void loadPick(load, wanted, options));
  }

  options.onLoaded();
}

/**
 * Draws the options one list loaded. When they reword what its field held (a name typed by hand becomes the value
 * of the option so named), the lists that need this field forget what they were asked with: they are asked again,
 * for the same organization under its listed spelling, and keep what was picked in them.
 * @example
 * showLoaded({ pick: organization, state, asked }, [{ value: 'tramlo', label: 'Tramlo' }], form.picks);
 * // "Tramlo", typed by hand, is now "tramlo": the projects typed under it stay
 */
function showLoaded(load: PickLoad, listed: readonly ConnectorOption[], picks: readonly PickField[]): void {
  const { pick, asked } = load;
  const before = JSON.stringify(pick.values());

  pick.show({ kind: 'loaded', options: listed });

  if (JSON.stringify(pick.values()) === before) return;

  for (const other of picks) {
    const state = asked.get(other.field.key);

    if (state !== undefined && other.field.needs.includes(pick.field.key)) state.needs = undefined;
  }
}

/**
 * Returns how long a list waits before it is asked again after a failure, or null when asking again by itself
 * would change nothing: a rate limit waits for its reset, and a service that could not be reached a few seconds,
 * twice as long after each of the `unreached` failures in a row before this one.
 * @example
 * retryWait({ kind: 'rate-limit', resetAt: now + 30_000 }, 0, now); // 30000
 * retryWait({ kind: 'network' }, 2, now); // 16000
 * retryWait({ kind: 'auth' }, 0, now); // null
 */
function retryWait(failure: ConnectorFailure, unreached: number, now: number): number | null {
  // A reset already past, or about to be, still leaves the service a moment.
  if (failure.kind === 'rate-limit') return Math.max(failure.resetAt - now, RETRY_MS);

  if (failure.kind === 'network') return Math.min(RETRY_MS * 2 ** unreached, MAX_RETRY_MS);

  return null;
}
