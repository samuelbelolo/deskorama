import type { Clock, Connector, ConnectorFetch, Language } from '@deskorama/core';
import type {
  DraftProblems,
  SaveAnswer,
  SourceDraft,
  SourcesSnapshot,
  TestAnswer,
} from '../../shared/settings-bridge.ts';
import type { SourceRuntime } from '../sources/create-source-runtime.ts';
import type { CursorStore } from '../sources/cursor-store.ts';
import type { SourceEntry } from '../sources/source-entry.ts';
import type { TokenStore } from '../sources/token-store.ts';
import { applyDraft } from './apply-draft.ts';
import { checkDraft } from './check-draft.ts';
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
}

/**
 * Returns the settings window's actions: it lists the Connectors and the Sources with their state, saves a checked
 * draft (its token to the Keychain, the rest to `settings.json`), removes a Source with its token and cursor, and
 * tests a draft. Every change reloads the running Sources.
 * @example
 * const service = createSettingsService({ lang: () => 'en', connectors: [createFeed()], runtime, tokens, cursors, clock,
 *   fetch, readSources, writeSources, newId: () => randomUUID() });
 * service.save({ id: null, connector: 'feed', name: 'Tramlo', values: { url }, token, interval: null });
 */
export function createSettingsService(options: SettingsServiceOptions): SettingsService {
  /** Returns the draft's Connector, or the fields to fix: an unknown Connector or the draft's own problems. */
  const checked = (draft: SourceDraft): { readonly connector: Connector } | { readonly problems: DraftProblems } => {
    const connector = options.connectors.find((candidate) => candidate.id === draft.connector);

    if (connector === undefined) return { problems: ['connector'] };

    const problems = checkDraft(draft, connector);

    return problems.length > 0 ? { problems } : { connector };
  };

  return {
    snapshot() {
      const connectors = options.connectors.map(({ id, title, config }) => ({
        id,
        title,
        fields: config.fields,
        permissions: config.permissions,
        interval: config.interval,
      }));

      const sources = options.runtime.states().map(({ entry, status }) => ({
        id: entry.id,
        connector: entry.connector,
        name: entry.name,
        values: entry.values,
        interval: entry.interval ?? null,
        status,
      }));

      return { connectors, sources };
    },

    save(draft) {
      const check = checked(draft);

      if ('problems' in check) return { ok: false, problems: check.problems };

      const before = options.readSources();
      const applied = applyDraft(before, draft, options.newId());

      // The Source was removed meanwhile, e.g. from another settings file: nothing to edit any more.
      if (applied === null) return { ok: false, problems: ['source'] };

      const { sources, saved } = applied;
      const previous = before.find((entry) => entry.id === saved.id);

      // The file first: if the Keychain then refuses the token, the Source shows a refused token instead of a token
      // left behind in the Keychain for a Source that does not exist.
      options.writeSources(sources);

      if (draft.token.trim() !== '') options.tokens.write(saved.id, draft.token.trim());

      // Another address is another Feed: its old cursor means nothing there.
      if (previous !== undefined && JSON.stringify(previous.values) !== JSON.stringify(saved.values)) {
        options.cursors.write(saved.id, null);
      }

      options.runtime.load(sources);

      // A Source stopped on a refused token polls again with the new one, even though its entry did not change.
      if (previous !== undefined && draft.token.trim() !== '') options.runtime.restart(saved.id);

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
      const check = checked(draft);

      if ('problems' in check) return { ok: false, problems: check.problems };

      const token = draft.token.trim() || (draft.id === null ? null : options.tokens.read(draft.id));

      if (token === null) return { ok: false, problems: ['token'] };

      const { connector } = check;

      const { fetch, clock } = options;

      return testDraft(draft, { connector, token, fetch, now: clock.now(), lang: options.lang() });
    },
  };
}
