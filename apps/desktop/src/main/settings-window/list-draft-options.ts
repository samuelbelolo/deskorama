import type { Connector, ConnectorFetch } from '@deskorama/core';
import type { OptionsAnswer, SourceDraft } from '../../shared/source-draft.ts';
import { failureOf } from '../sources/failure-of.ts';
import { draftSettings } from './draft-settings.ts';

/** How many options the window is sent at most: a longer list is typed by hand past that. */
const MAX_OPTIONS = 500;

/** What loading the options of a draft's field needs besides the draft. */
export interface OptionsCall {
  readonly connector: Connector;
  readonly token: string;
  readonly fetch: ConnectorFetch;
  readonly now: number;
}

/**
 * Asks a draft's Connector for the options of one of its fields, with what the draft holds so far, and returns them
 * or the failure the person reads: a refused token, the permission listing lacks. A field the Connector lists
 * nothing for is an answer it cannot read. Nothing is saved.
 * @example
 * await listDraftOptions(draft, 'projects', { connector: createVercel(), token, fetch, now });
 * // { ok: true, options: [{ value: 'prj_web', label: 'tramlo-web' }] }
 */
export async function listDraftOptions(draft: SourceDraft, field: string, call: OptionsCall): Promise<OptionsAnswer> {
  const { connector, fetch, now } = call;

  const loaded = connector.config.fields.some(
    (candidate) => candidate.key === field && (candidate.kind === 'pick-one' || candidate.kind === 'pick-many'),
  );

  if (!loaded || connector.listOptions === undefined) return { ok: false, failure: { kind: 'invalid-response' } };

  const settings = draftSettings(draft, call.token);

  try {
    const options = await connector.listOptions({ field, settings, fetch, now });

    return { ok: true, options: options.slice(0, MAX_OPTIONS) };
  } catch (error) {
    return { ok: false, failure: failureOf(error) };
  }
}
