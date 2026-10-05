import type { Clock, Connector, ConnectorFetch, Language } from '@deskorama/core';
import type { SourcesSnapshot } from '../../shared/settings-snapshot.ts';
import type {
  DraftGone,
  DraftProblems,
  OptionsAnswer,
  SaveAnswer,
  SourceDraft,
  TestAnswer,
} from '../../shared/source-draft.ts';
import type { SourceStatus } from '../../shared/source-status.ts';
import type { SourceRuntime } from '../sources/create-source-runtime.ts';
import type { CursorStore } from '../sources/cursor-store.ts';
import { readsOf } from '../sources/reads-of.ts';
import type { SourceEntry } from '../sources/source-entry.ts';
import type { TokenStore } from '../sources/token-store.ts';
import { applyDraft } from './apply-draft.ts';
import { checkDraft } from './check-draft.ts';
import { connectorView } from './connector-view.ts';
import { draftToken } from './draft-token.ts';
import { listDraftOptions } from './list-draft-options.ts';
import { sourceView } from './source-view.ts';
import { testDraft } from './test-draft.ts';

/** What the settings window acts on. */
export interface SettingsServiceOptions {
  /** The display language now, in which a test shows the Events it read. */
  readonly lang: () => Language;
  readonly connectors: readonly Connector[];
  readonly runtime: SourceRuntime;
  readonly tokens: TokenStore;
  readonly cursors: CursorStore;
  readonly clock: Clock;
  readonly fetch: ConnectorFetch;
  readonly readSources: () => readonly SourceEntry[];
  readonly writeSources: (sources: readonly SourceEntry[]) => void;
  /** A new, unique Source id. */
  readonly newId: () => string;
}

/** What the settings window may do with the Sources. */
export interface SettingsService {
  snapshot(): SourcesSnapshot;
  save(draft: SourceDraft): SaveAnswer;
  remove(id: string): void;
  test(draft: SourceDraft): Promise<TestAnswer>;
  listOptions(draft: SourceDraft, field: string): Promise<OptionsAnswer>;
}

/**
 * Returns the settings window's actions: it lists the Connectors as they describe themselves and the Sources with
 * their state and last Event, saves a checked
 * draft (its token to the Keychain, the rest to `settings.json`, or neither when the Keychain refuses the token and
 * throws), removes a Source with its token and cursor, tests a draft, and loads the options of a draft's field.
 * Every change reloads the running Sources.
 * @example
 * const service = createSettingsService({ lang: () => 'en', connectors: [createFeed()], runtime, tokens, cursors, clock,
 *   fetch, readSources, writeSources, newId: () => randomUUID() });
 * service.save({ id: null, connector: 'feed', name: 'Tramlo', values: { url }, token, interval: null });
 */
export function createSettingsService(options: SettingsServiceOptions): SettingsService {
  return {
    snapshot() {
      const lang = options.lang();

      const connectors = options.connectors.map(connectorView);
      const sources = options.runtime.states().map((state) => sourceView(state, lang));

      return { connectors, sources };
    },

    save(draft) {
      const check = checkedDraft(draft, options.connectors);

      if ('refusal' in check) return check.refusal;

      const before = options.readSources();
      const applied = applyDraft(before, draft, options.newId());

      // The Source was removed meanwhile, e.g. from another settings file: nothing to edit any more.
      if (applied === null) return { ok: false, gone: 'source' };

      const { sources, saved } = applied;
      const previous = before.find((entry) => entry.id === saved.id);

      // The file first, so no token is left behind in the Keychain for a Source that does not exist. If the Keychain
      // then refuses the token, the file goes back to what it held: nothing is saved, and saving again once the
      // Keychain is unlocked does not add the Source a second time.
      options.writeSources(sources);

      try {
        if (draft.token.trim() !== '') options.tokens.write(saved.id, draft.token.trim());
      } catch (error) {
        options.writeSources(before);

        throw error;
      }

      const { fields } = check.connector.config;

      // Another address is another Feed, and other projects are other Events: the old cursor means nothing there.
      // A name the loaded list turned into its ID is another value too, and starts over once.
      if (previous !== undefined && readsOf(previous, fields) !== readsOf(saved, fields)) {
        options.cursors.write(saved.id, null);
      }

      // Read before the reload, which keeps the state of a Source whose entry did not change.
      const halted = options.runtime.states().some((state) => state.entry.id === saved.id && isHalted(state.status));

      options.runtime.load(sources);

      // A Source stopped on a refused token or a missing permission polls again, even though its entry did not
      // change: with the token just typed, or with the one in the Keychain once it is fixed on the service's side.
      if (previous !== undefined && (draft.token.trim() !== '' || halted)) options.runtime.restart(saved.id);

      return { ok: true };
    },

    remove(id) {
      const sources = options.readSources().filter((entry) => entry.id !== id);

      // The file first, so a failure never leaves a listed Source without its token.
      options.writeSources(sources);
      options.runtime.load(sources);
      options.tokens.remove(id);
      options.cursors.write(id, null);
    },

    async test(draft) {
      const check = checkedDraft(draft, options.connectors);

      if ('refusal' in check) return check.refusal;

      const token = draftToken(draft, options.tokens);

      if (token === null) return { ok: false, problems: ['token'] };

      const { connector } = check;

      const { fetch, clock } = options;

      return testDraft(draft, { connector, token, fetch, now: clock.now(), lang: options.lang() });
    },

    async listOptions(draft, field) {
      const connector = options.connectors.find((candidate) => candidate.id === draft.connector);

      if (connector === undefined) return { ok: false, gone: 'connector' };

      const token = draftToken(draft, options.tokens);

      // Nothing is checked but the token: the name and the other fields may still be empty while a list loads.
      if (token === null) return { ok: false, failure: { kind: 'auth' } };

      const { fetch, clock } = options;

      return listDraftOptions(draft, field, { connector, token, fetch, now: clock.now() });
    },
  };
}

/** The answer that refuses a draft before anything is saved or polled. */
type Refusal = DraftGone | { readonly ok: false; readonly problems: DraftProblems };

/**
 * Returns the draft's Connector, or the answer that refuses the draft: the app does not know its Connector, or some
 * of its fields need fixing.
 * @example
 * checkedDraft(draft, [createFeed()]); // { connector: the Feed }
 * checkedDraft({ ...draft, name: ' ' }, [createFeed()]); // { refusal: { ok: false, problems: ['name'] } }
 * checkedDraft({ ...draft, connector: 'gone' }, [createFeed()]); // { refusal: { ok: false, gone: 'connector' } }
 */
function checkedDraft(
  draft: SourceDraft,
  connectors: readonly Connector[],
): { readonly connector: Connector } | { readonly refusal: Refusal } {
  const connector = connectors.find((candidate) => candidate.id === draft.connector);

  if (connector === undefined) return { refusal: { ok: false, gone: 'connector' } };

  const problems = checkDraft(draft, connector);

  return problems.length > 0 ? { refusal: { ok: false, problems } } : { connector };
}

/**
 * Returns true when a Source is stopped until the person edits it: its token was refused, or lacks a permission.
 * @example
 * isHalted({ state: 'failing', failure: { kind: 'permission', permission: 'Charges: Read' }, at: now }); // true
 * isHalted({ state: 'failing', failure: { kind: 'network' }, at: now }); // false
 */
function isHalted(status: SourceStatus): boolean {
  return status.state === 'failing' && (status.failure.kind === 'auth' || status.failure.kind === 'permission');
}
