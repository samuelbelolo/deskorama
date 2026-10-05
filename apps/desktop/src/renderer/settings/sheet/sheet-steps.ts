import type { Language } from '@deskorama/core';
import type { ConnectorView } from '../../../shared/settings-snapshot.ts';
import { element } from '../element.ts';
import { icon } from '../icon.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import { permissionsList } from './permissions-list.ts';
import { step } from './step.ts';

/** The four steps of a connection sheet, laid out in its two columns. */
export interface SheetSteps {
  /** Create the token, then tick its permissions. */
  readonly left: readonly HTMLElement[];
  /** Paste the token, then test it. */
  readonly right: readonly HTMLElement[];
  /** Checks the first three steps once there is a token to work with, and the fourth once a test has passed. */
  readonly setDone: (done: { readonly token: boolean; readonly test: boolean }) => void;
}

/** What the steps are built around: they hold these, and the sheet drives them. */
export interface SheetStepParts {
  readonly token: HTMLInputElement;
  /** Where a test says what it found. */
  readonly result: HTMLElement;
  readonly testButton: HTMLButtonElement;
  /** Opens the page where the token is created. */
  readonly openTokenPage: () => void;
}

/**
 * Returns the four steps of a connection sheet, in the Connector's own words: create the token, with what to
 * choose on its page and a button that opens it (none for a token that comes from the person's own backend), tick
 * its read-only permissions, paste it, test it.
 * @example
 * const steps = sheetSteps(github, 'fr', { token, result, testButton, openTokenPage });
 * steps.setDone({ token: true, test: false }); // steps 1 to 3 are checked
 */
export function sheetSteps(connector: ConnectorView, lang: Language, parts: SheetStepParts): SheetSteps {
  const text = SETTINGS_TEXT[lang];
  const { page, note } = connector.about.token;

  const open =
    page === null
      ? null
      : element('button', { className: 'btn', attributes: { type: 'button' }, onClick: parts.openTokenPage }, [
          element('span', { text: text.sheetOpen(page.site) }),
          icon('arrow-up-right'),
        ]);

  const create = step(1, text.sheetCreate, [
    element('div', { className: 'step-inline' }, [element('p', { text: note[lang] }), open]),
  ]);

  const tick = step(2, text.sheetTick, [permissionsList(connector.permissions, lang)]);

  const paste = step(3, text.sheetPaste, [
    parts.token,
    element('p', { className: 'keychain' }, [icon('lock-simple'), element('span', { text: text.sheetKeychain })]),
  ]);

  const test = step(4, text.sheetTestTitle, [parts.result], parts.testButton);

  return {
    left: [create.node, tick.node],
    right: [paste.node, test.node],

    setDone(done) {
      for (const each of [create, tick, paste]) each.setDone(done.token);

      test.setDone(done.test);
    },
  };
}
