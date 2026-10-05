import type { Language } from '@deskorama/core';
import type { ConnectorView } from '../../../shared/settings-snapshot.ts';
import { element } from '../element.ts';
import { icon } from '../icon.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import { permissionsList } from './permissions-list.ts';
import { step } from './step.ts';

/** The steps of a connection sheet, laid out in its two columns and under them. */
export interface SheetSteps {
  /** Create the token, then tick its permissions. */
  readonly left: readonly HTMLElement[];
  /** Paste the token and, for a Connector with nothing to pick, test it. */
  readonly right: readonly HTMLElement[];
  /** Across both columns, for a Connector with fields picked from lists: choose what to follow, then test. */
  readonly below: readonly HTMLElement[];
  /**
   * Checks the first three steps once there is a token to work with, the choice once every list holds what it
   * must, and the test once it has passed.
   */
  readonly setDone: (done: { readonly token: boolean; readonly picksFilled: boolean; readonly test: boolean }) => void;
}

/** What the steps are built around: they hold these, and the sheet drives them. */
export interface SheetStepParts {
  readonly token: HTMLInputElement;
  /** The fields picked from what the token can see; none for a Connector that has none. */
  readonly picks: readonly HTMLElement[];
  /** Where a test says what it found. */
  readonly result: HTMLElement;
  readonly testButton: HTMLButtonElement;
  /** Opens the page where the token is created. */
  readonly openTokenPage: () => void;
}

/**
 * Returns the steps of a connection sheet, in the Connector's own words: create the token, with what to choose on
 * its page and a button that opens it (none for a token that comes from the person's own backend), tick its
 * read-only permissions, paste it, test it. A Connector with fields picked from what the token can see gets a step
 * before the test, after the token those lists are loaded with: choose what to follow.
 * @example
 * const steps = sheetSteps(github, 'fr', { token, picks: [], result, testButton, openTokenPage });
 * steps.setDone({ token: true, picksFilled: true, test: false }); // steps 1 to 3 are checked
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

  const choose =
    parts.picks.length === 0 ? null : step(4, text.sheetChoose, [element('div', { className: 'picks' }, parts.picks)]);

  const test = step(choose === null ? 4 : 5, text.sheetTestTitle, [parts.result], parts.testButton);

  return {
    left: [create.node, tick.node],
    right: choose === null ? [paste.node, test.node] : [paste.node],
    below: choose === null ? [] : [choose.node, test.node],

    setDone(done) {
      for (const each of [create, tick, paste]) each.setDone(done.token);

      choose?.setDone(done.token && done.picksFilled);
      test.setDone(done.test);
    },
  };
}
