import { element } from '../element.ts';
import { icon, type IconName } from '../icon.ts';

/**
 * Returns a square push button that shows only a glyph, named for assistive technology and on hover.
 * @example
 * iconButton('eye', 'Show the secret', reveal);
 */
export function iconButton(glyph: IconName, label: string, onClick: (event: MouseEvent) => void): HTMLButtonElement {
  return element(
    'button',
    { className: 'btn icon-only', attributes: { type: 'button', title: label, 'aria-label': label }, onClick },
    [icon(glyph)],
  );
}
