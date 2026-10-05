import type { SettingsBridge } from '../../../shared/settings-bridge.ts';
import type { DraftProblems } from '../../../shared/source-draft.ts';
import type { SheetForm } from './sheet-form.ts';

/**
 * What saving a connection sheet's draft gave: saved, or the fields to fix, none when there is nothing to fix and
 * the save simply did not work.
 */
export type SaveOutcome = { readonly kind: 'saved' } | { readonly kind: 'fix'; readonly problems: DraftProblems };

/**
 * Saves what a connection sheet's form holds and returns what it gave. An interval that cannot be read is a field
 * to fix and nothing is sent. A Source removed meanwhile, or a Connector the app no longer knows, has no field to
 * fix.
 * @example
 * await runSave(form, bridge); // { kind: 'saved' }
 * await runSave(formWithoutName, bridge); // { kind: 'fix', problems: ['name'] }
 */
export async function runSave(form: SheetForm, bridge: Pick<SettingsBridge, 'save'>): Promise<SaveOutcome> {
  if (form.every.unreadable()) return { kind: 'fix', problems: ['interval'] };

  const answer = await bridge.save(form.draft());

  if (answer.ok) return { kind: 'saved' };

  return { kind: 'fix', problems: 'gone' in answer ? [] : answer.problems };
}
