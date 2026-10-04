import type { Language } from '@deskorama/core';
import { MAX_NAME_LENGTH } from '../../shared/max-name-length.ts';
import type { ConnectorView, DraftProblems, SourceDraft, TestAnswer } from '../../shared/settings-bridge.ts';
import { element } from './element.ts';
import { labelledInput } from './labelled-input.ts';
import { renderTestResult } from './render-test-result.ts';
import { SETTINGS_TEXT } from './settings-text.ts';

/** What the form's buttons do; `save` and `test` answer with the fields to fix, if any. */
export interface SourceFormActions {
  readonly save: (draft: SourceDraft) => Promise<DraftProblems>;
  readonly test: (draft: SourceDraft) => Promise<TestAnswer>;
  readonly cancel: () => void;
}

/** The Source the form edits, or the empty values of a new one. */
export interface FormStart {
  readonly id: string | null;
  readonly name: string;
  readonly values: Readonly<Record<string, string>>;
}

/**
 * Returns the form that adds or edits a Source of one Connector: its name, the Connector's fields, the token (a
 * password field, left empty to keep the current one when editing) with the permissions it needs, and test, save
 * and cancel buttons. A test shows the latest Events or what to fix, without saving.
 * @example
 * root.append(renderSourceForm(feedView, { id: null, name: '', values: {} }, 'fr', { save, test, cancel }));
 */
export function renderSourceForm(
  connector: ConnectorView,
  start: FormStart,
  lang: Language,
  actions: SourceFormActions,
): HTMLElement {
  const text = SETTINGS_TEXT[lang];

  const name = labelledInput('name', text.name, start.name, {
    placeholder: text.namePlaceholder,
    maxlength: String(MAX_NAME_LENGTH),
  });

  const fields = connector.fields.map((described) =>
    labelledInput(described.key, described.label[lang], start.values[described.key] ?? '', {
      placeholder: described.placeholder,
      type: described.kind === 'url' ? 'url' : 'text',
    }),
  );

  const token = labelledInput('token', text.token, '', {
    type: 'password',
    autocomplete: 'off',
    ...(start.id === null ? {} : { placeholder: text.keepToken }),
  });

  const permissions = element(
    'ul',
    { className: 'permissions' },
    connector.permissions.map((permission) => element('li', { text: `${permission.name} — ${permission.why[lang]}` })),
  );

  const result = element('div', { className: 'result', attributes: { 'aria-live': 'polite' } });

  const all = [name, ...fields, token];

  const draft = (): SourceDraft => ({
    id: start.id,
    connector: connector.id,
    name: name.field.value,
    values: Object.fromEntries(fields.map(({ key, field }) => [key, field.value])),
    token: token.field.value,
  });

  const mark = (problems: DraftProblems): void => {
    for (const { key, field } of all) field.setAttribute('aria-invalid', String(problems.includes(key)));

    if (problems.length > 0) result.replaceChildren(element('p', { className: 'result failing', text: text.fix }));
  };

  const testButton = element('button', { text: text.test });
  const saveButton = element('button', { className: 'primary', text: text.save });
  const cancelButton = element('button', { text: text.cancel });

  /** Runs one request with test and save turned off, so a second click cannot send it twice, and says if it failed. */
  const busy = (request: () => Promise<void>): void => {
    testButton.disabled = true;
    saveButton.disabled = true;

    request()
      .catch(() => result.replaceChildren(element('p', { className: 'result failing', text: text.failed })))
      .finally(() => {
        testButton.disabled = false;
        saveButton.disabled = false;
      });
  };

  testButton.addEventListener('click', () =>
    busy(async () => {
      result.replaceChildren(element('p', { className: 'hint', text: text.testing }));

      const answer = await actions.test(draft());

      mark(answer.ok ? [] : answer.problems);

      if (answer.ok || answer.problems.length === 0) result.replaceChildren(renderTestResult(answer, lang));
    }),
  );

  saveButton.addEventListener('click', () => busy(async () => mark(await actions.save(draft()))));
  cancelButton.addEventListener('click', actions.cancel);

  return element('section', { className: 'panel' }, [
    element('h2', { text: connector.title[lang] }),
    ...name.nodes,
    ...fields.flatMap(({ nodes }) => nodes),
    ...token.nodes,
    element('p', { className: 'hint', text: text.permissions }),
    permissions,
    result,
    element('div', { className: 'buttons' }, [cancelButton, testButton, saveButton]),
  ]);
}
