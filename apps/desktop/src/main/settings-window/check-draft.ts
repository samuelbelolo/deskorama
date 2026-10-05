import type { Connector } from '@deskorama/core';
import { MAX_NAME_LENGTH } from '../../shared/max-name-length.ts';
import type { DraftProblems, SourceDraft } from '../../shared/source-draft.ts';
import { fieldIsFilled } from './field-is-filled.ts';

/** The longest token accepted: real ones are a few hundred characters. */
const MAX_TOKEN_LENGTH = 4096;

/**
 * Returns the fields of a draft that need fixing: a name, every field of its Connector as its kind asks, an
 * interval within the Connector's bounds when one is chosen, and a token unless an edited Source keeps the one in
 * the Keychain.
 * @example
 * const draft = { id: null, connector: 'feed', name: 'Tramlo', values: { url: 'http://x.example' }, token: '' };
 * checkDraft({ ...draft, interval: 1000 }, feed); // ['url', 'interval', 'token']
 */
export function checkDraft(draft: SourceDraft, connector: Connector): DraftProblems {
  const problems: string[] = [];

  const name = draft.name.trim();

  if (name === '' || name.length > MAX_NAME_LENGTH) problems.push('name');

  for (const field of connector.config.fields) {
    if (!fieldIsFilled(field, draft)) problems.push(field.key);
  }

  const { interval } = draft;
  const bounds = connector.config.interval;

  if (interval !== null && (!Number.isInteger(interval) || interval < bounds.min || interval > bounds.max)) {
    problems.push('interval');
  }

  const token = draft.token.trim();

  if ((draft.id === null && token === '') || token.length > MAX_TOKEN_LENGTH || /\s/.test(token))
    problems.push('token');

  return problems;
}
