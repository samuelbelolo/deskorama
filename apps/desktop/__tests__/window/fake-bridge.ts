import type { SettingsBridge } from '../../src/shared/settings-bridge.ts';
import type { LoginItemState, SettingsSnapshot } from '../../src/shared/settings-snapshot.ts';
import type { SaveAnswer, SourceDraft, TestAnswer } from '../../src/shared/source-draft.ts';

/** One request the window sent through its bridge: the method's name and its arguments. */
type BridgeCall = readonly [method: string, ...payload: unknown[]];

/** A bridge that answers from a script and records what the window asked. */
export interface FakeBridge {
  readonly bridge: SettingsBridge;
  readonly calls: BridgeCall[];
  /** Replaces what `load` answers and tells the window, as the main process does after a change. */
  readonly change: (snapshot: SettingsSnapshot) => void;
}

/**
 * What the fake answers where a test scripts it. Unless told otherwise, a test and a save pass with nothing found,
 * macOS grants opening at login as asked, and a new secret is drawn.
 */
export interface FakeAnswers {
  readonly test?: (draft: SourceDraft) => TestAnswer;
  readonly save?: (draft: SourceDraft) => SaveAnswer;
  /** What macOS reports once asked to open the app at login, or not any more. */
  readonly setOpenAtLogin?: (on: boolean) => LoginItemState;
  /** Runs when a new secret is asked for: throwing refuses it, as a Keychain that cannot keep it does. */
  readonly regenerateSecret?: () => void;
}

/**
 * Returns a fake of the settings bridge that starts on `snapshot`: the window is driven exactly as in the app,
 * without a main process behind it.
 * @example
 * const { bridge, calls } = fakeBridge(emptySnapshot('fr'));
 * await mountSettingsWindow(root, bridge);
 * calls; // [['load']]
 */
export function fakeBridge(snapshot: SettingsSnapshot, answers: FakeAnswers = {}): FakeBridge {
  const calls: BridgeCall[] = [];
  const listeners = new Set<(next: SettingsSnapshot) => void>();
  let current = snapshot;

  /** Records a request, and answers `value` on the next turn, as an IPC answer comes. */
  const answer = async <Value>(call: BridgeCall, value: Value): Promise<Value> => {
    calls.push(call);

    return value;
  };

  const bridge: SettingsBridge = {
    load: () => answer(['load'], current),
    save: (draft) => answer(['save', draft], answers.save?.(draft) ?? { ok: true }),
    remove: (id) => answer(['remove', id], undefined),
    test: (draft) => answer(['test', draft], answers.test?.(draft) ?? { ok: true, events: [], gauges: {} }),
    setPreferences: (change) => answer(['setPreferences', change], undefined),
    setOpenAtLogin: (on) =>
      answer(['setOpenAtLogin', on], answers.setOpenAtLogin?.(on) ?? { on, needsApproval: false }),
    playTest: (choice) => answer(['playTest', choice], undefined),
    openTokenPage: (connector, values) => answer(['openTokenPage', connector, values], undefined),
    copy: (choice) => answer(['copy', choice], undefined),
    revealSecret: () => answer(['revealSecret'], 'f3a9-fictional-secret-0001'),
    setWebhookOn: (on) => answer(['setWebhookOn', on], undefined),
    regenerateSecret: async () => {
      calls.push(['regenerateSecret']);

      // Inside the promise, so a refusal reaches the window as a rejected request, as over IPC.
      answers.regenerateSecret?.();
    },
    onChanged(listener) {
      listeners.add(listener);

      return () => void listeners.delete(listener);
    },
  };

  return {
    bridge,
    calls,
    change(next) {
      current = next;

      for (const listener of listeners) listener(next);
    },
  };
}
