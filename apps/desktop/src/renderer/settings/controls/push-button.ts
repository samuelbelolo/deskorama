import { element } from '../element.ts';

/** How a push button looks: plain, the default action of its sheet, or one that removes something. */
export type ButtonKind = 'plain' | 'primary' | 'danger';

/**
 * Returns a push button with a text label, drawn after the macOS one; `large` is the size of a sheet's buttons.
 * @example
 * pushButton('Save', save, { kind: 'primary', large: true });
 */
export function pushButton(
  label: string,
  onClick: (event: MouseEvent) => void,
  look: { readonly kind?: ButtonKind; readonly large?: boolean } = {},
): HTMLButtonElement {
  const classes = ['btn', look.kind === undefined || look.kind === 'plain' ? '' : look.kind, look.large ? 'large' : ''];

  return element('button', {
    className: classes.filter((name) => name !== '').join(' '),
    text: label,
    attributes: { type: 'button' },
    onClick,
  });
}
