import { pushButton } from './controls/push-button.ts';
import { element } from './element.ts';

/** The words of a confirmation. */
export interface ConfirmWords {
  readonly title: string;
  readonly body: string;
  readonly confirm: string;
  readonly cancel: string;
}

/**
 * Returns a small sheet that asks once more before something that cannot be undone. Cancel comes first, so the
 * keyboard lands on the safe answer.
 * @example
 * confirmSheet({ title: 'Remove Tramlo?', body: '…', confirm: 'Remove', cancel: 'Cancel' }, { confirm, cancel });
 */
export function confirmSheet(
  words: ConfirmWords,
  actions: { readonly confirm: () => void; readonly cancel: () => void },
): HTMLElement {
  return element(
    'section',
    {
      className: 'sheet alert',
      attributes: {
        role: 'alertdialog',
        'aria-modal': 'true',
        'aria-labelledby': 'alert-title',
        'aria-describedby': 'alert-body',
      },
    },
    [
      element('h2', { text: words.title, attributes: { id: 'alert-title' } }),
      element('p', { text: words.body, attributes: { id: 'alert-body' } }),
      element('footer', { className: 'alert-buttons' }, [
        pushButton(words.cancel, actions.cancel, { large: true }),
        pushButton(words.confirm, actions.confirm, { kind: 'danger', large: true }),
      ]),
    ],
  );
}
