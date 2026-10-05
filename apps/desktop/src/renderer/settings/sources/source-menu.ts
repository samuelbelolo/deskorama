import { iconButton } from '../controls/icon-button.ts';
import { element } from '../element.ts';
import { closeSourceMenus } from './close-source-menus.ts';

/** One item of a row's menu. */
export interface MenuItem {
  readonly label: string;
  readonly danger?: boolean;
  readonly onChoose: () => void;
}

/**
 * Returns the "more" button of a row and the small menu it opens; a danger item sits under a separator. Opening it
 * closes the menu of any other row, its own button closes it again, and so does Escape, which gives the keyboard
 * back to the button. The window closes every open menu on a click anywhere else.
 * @example
 * sourceMenu('More actions for Tramlo', [{ label: 'Edit…', onChoose: edit }, { label: 'Remove', danger: true, onChoose: remove }]);
 */
export function sourceMenu(label: string, items: readonly MenuItem[]): HTMLElement {
  const entries = items.flatMap((item) => [
    item.danger === true ? element('hr') : null,
    element('button', {
      className: item.danger === true ? 'menu-item danger' : 'menu-item',
      text: item.label,
      attributes: { type: 'button', role: 'menuitem' },
      onClick: item.onChoose,
    }),
  ]);

  const menu = element('div', { className: 'menu', attributes: { role: 'menu' } }, entries);

  menu.hidden = true;

  const button = iconButton('dots-three', label, (event) => {
    const opening = menu.hidden;

    // Whatever this click does, no other row keeps its menu open, and this one closes if it was open.
    closeSourceMenus(document);

    if (!opening) return;

    // Opening is not a click "elsewhere": the window would close the menu this click opens.
    event.stopPropagation();

    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
  });

  button.setAttribute('aria-haspopup', 'menu');
  button.setAttribute('aria-expanded', 'false');

  const anchor = element('div', { className: 'menu-anchor' }, [button, menu]);

  anchor.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || menu.hidden) return;

    closeSourceMenus(document);
    button.focus();
  });

  return anchor;
}
