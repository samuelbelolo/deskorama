import type { SettingsBridge } from '../../../shared/settings-bridge.ts';
import type { DraftProblems, TestFindings } from '../../../shared/source-draft.ts';
import type { SourceStatus } from '../../../shared/source-status.ts';
import type { SheetForm } from './sheet-form.ts';

/**
 * What testing a connection sheet's draft gave: what the service answered, why it refused, or the fields to fix,
 * none when there is nothing to fix and the test simply did not work.
 */
export type TestOutcome =
  | { readonly kind: 'passed'; readonly findings: TestFindings }
  | { readonly kind: 'refused'; readonly status: SourceStatus }
  | { readonly kind: 'fix'; readonly problems: DraftProblems };

/**
 * Tests what a connection sheet's form holds, with one poll that saves nothing, and returns what it gave. An
 * interval that cannot be read is a field to fix and nothing is asked; otherwise `asking` runs just before the
 * main process is asked. A draft whose Connector the app no longer knows has no field to fix.
 * @example
 * await runTest(form, bridge, showTheWait); // { kind: 'passed', findings: { events: [merged], gauges: {} } }
 */
export async function runTest(
  form: SheetForm,
  bridge: Pick<SettingsBridge, 'test'>,
  asking: () => void,
): Promise<TestOutcome> {
  if (form.every.unreadable()) return { kind: 'fix', problems: ['interval'] };

  asking();

  const answer = await bridge.test(form.draft());

  if (answer.ok) return { kind: 'passed', findings: answer };

  if ('status' in answer) return { kind: 'refused', status: answer.status };

  return { kind: 'fix', problems: 'gone' in answer ? [] : answer.problems };
}
