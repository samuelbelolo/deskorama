import type { Language } from '@deskorama/core';
import type { SettingsBridge } from '../../../shared/settings-bridge.ts';
import type { ConnectorView } from '../../../shared/settings-snapshot.ts';
import type { DraftProblems } from '../../../shared/source-draft.ts';
import { pushButton } from '../controls/push-button.ts';
import { element } from '../element.ts';
import { sourceStanding } from '../source-standing.ts';
import { statusLine } from '../status-line.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import { renderFindings } from './render-findings.ts';
import { runSave } from './run-save.ts';
import { runTest, type TestOutcome } from './run-test.ts';
import { sheetForm } from './sheet-form.ts';
import { sheetLayout } from './sheet-layout.ts';
import type { SheetStart } from './sheet-start.ts';
import { sheetSteps } from './sheet-steps.ts';

/** What a connection sheet connects, and what it tells once done. */
export interface ConnectionSheetOptions {
  readonly connector: ConnectorView;
  readonly start: SheetStart;
  readonly lang: Language;
  readonly bridge: Pick<SettingsBridge, 'test' | 'save' | 'openTokenPage'>;
  /** Called once the Source is saved. */
  readonly onSaved: () => void;
  readonly onCancel: () => void;
}

/**
 * Returns the sheet that connects a Source of one Connector, or edits one, in four steps: create the token (a
 * button opens the Connector's page, with what to choose there), tick its read-only permissions, paste it, test it.
 * The footer holds the polling interval and the decision. Save stays off until a test has passed for exactly what
 * the fields hold: changing a field or the token asks for a new test, and so does testing again, which vouches for
 * nothing until it passes. Nothing is stored before Save.
 * @example
 * const start = { id: null, name: '', values: {}, interval: null };
 * sheets.show(connectionSheet({ connector: github, start, lang: 'fr', bridge, onSaved, onCancel }), onCancel);
 */
export function connectionSheet(options: ConnectionSheetOptions): HTMLElement {
  const { connector, lang, bridge } = options;
  const text = SETTINGS_TEXT[lang];

  const form = sheetForm(connector, options.start, lang);
  const result = element('div', { className: 'test-result', attributes: { role: 'status', 'aria-live': 'polite' } });

  const testButton = pushButton(text.sheetTest, () => busyWhile(test));
  const saveButton = pushButton(text.save, () => busyWhile(save), { kind: 'primary', large: true });

  const steps = sheetSteps(connector, lang, {
    token: form.token,
    result,
    testButton,
    // A page the browser could not open leaves nothing to draw again.
    openTokenPage: () => void bridge.openTokenPage(connector.id, form.values()).catch(() => {}),
  });

  // What the fields held when a test last passed; null while no test vouches for them.
  let passed: string | null = null;
  let busy = false;

  /** Draws what follows from the fields: the steps done, and whether a test or a save can be asked. */
  const refresh = (): void => {
    // A change after a passing test makes its result stale: it goes, and Save waits for a new test.
    if (passed !== null && passed !== form.tested()) {
      passed = null;
      result.replaceChildren();
    }

    steps.setDone({ token: form.hasToken(), test: passed !== null });
    testButton.textContent = passed === null ? text.sheetTest : text.sheetRetest;
    testButton.disabled = busy || !form.hasToken();
    saveButton.disabled = busy || passed === null;
  };

  /** Turns test and save off while a request runs, so a second click cannot send it twice. */
  const setBusy = (now: boolean): void => {
    busy = now;
    refresh();
  };

  /** Marks the fields to fix and says so; with none to fix, says that it did not work. */
  const markProblems = (problems: DraftProblems): void => {
    form.mark(problems);
    result.replaceChildren(statusLine('bad', problems.length === 0 ? text.sheetFailed : text.sheetFix));
  };

  const busyWhile = (request: () => Promise<void>): void => whileBusy(request, setBusy, () => markProblems([]));

  const test = async (): Promise<void> => {
    const asked = form.tested();

    const outcome = await runTest(form, bridge, () => {
      // A test under way vouches for nothing yet: an earlier pass is forgotten, and Save waits.
      passed = null;
      refresh();
      result.replaceChildren(statusLine('wait', text.sheetTesting));
    });

    if (outcome.kind === 'fix') return markProblems(outcome.problems);

    form.mark([]);
    result.replaceChildren(...testSaid(outcome, connector, form.where(), lang));

    if (outcome.kind === 'passed') passed = asked;
  };

  const save = async (): Promise<void> => {
    const outcome = await runSave(form, bridge);

    if (outcome.kind === 'saved') options.onSaved();
    else markProblems(outcome.problems);
  };

  const buttons = [pushButton(text.cancel, options.onCancel, { large: true }), saveButton];
  const sheet = sheetLayout(connector, lang, { form, steps, buttons });

  sheet.addEventListener('input', refresh);
  refresh();

  return sheet;
}

/**
 * Runs one request, with `setBusy(true)` before it and `setBusy(false)` once it settles; `onBroken` runs first when
 * it throws, which only a request the main process could not answer does.
 * @example
 * whileBusy(save, setBusy, sayItFailed); // Save is off until the main process has answered
 */
function whileBusy(request: () => Promise<void>, setBusy: (busy: boolean) => void, onBroken: () => void): void {
  setBusy(true);

  request()
    .catch(onBroken)
    .finally(() => setBusy(false));
}

/**
 * Returns what the sheet says of a test the service answered: what it found, with a reminder that nothing is saved
 * yet, or why it refused, in the app's own words.
 * @example
 * testSaid({ kind: 'refused', status: tokenRefused }, github, 'tramlo/tramlo-app', 'en');
 * // [the line "Token refused: paste a new one."]
 */
function testSaid(
  outcome: Exclude<TestOutcome, { readonly kind: 'fix' }>,
  connector: ConnectorView,
  where: string,
  lang: Language,
): Node[] {
  if (outcome.kind === 'refused') {
    const standing = sourceStanding(outcome.status, lang);

    return [statusLine(standing.kind, standing.sentence)];
  }

  const note = element('p', { className: 'test-foot', text: SETTINGS_TEXT[lang].sheetNothingSaved });

  return [...renderFindings(outcome.findings, connector, where, lang), note];
}
