/**
 * Closes every open row menu under `root` and tells each one's "more" button that its menu is closed. A row menu is
 * the `.menu` that follows its button, as `sourceMenu` builds it.
 * @example
 * closeSourceMenus(root); // a click elsewhere in the window: no menu stays open
 * closeSourceMenus(document); // before a row opens its own menu: the other rows' menus close
 */
export function closeSourceMenus(root: ParentNode): void {
  for (const menu of root.querySelectorAll<HTMLElement>('.menu:not([hidden])')) {
    menu.hidden = true;
    menu.previousElementSibling?.setAttribute('aria-expanded', 'false');
  }
}
