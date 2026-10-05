/**
 * Runs `redraw`, which replaces what `container` holds, and keeps the keyboard where it was: when an element inside
 * `container` had it, the element that now stands at the same place takes it, if there is one of the same kind.
 * Without this the keyboard would fall back to the page each time the window is drawn again.
 * @example
 * keepFocus(frame.sidebar, () => frame.sidebar.replaceChildren(...sidebar(view, go)));
 * // Space on "Sources" draws the sidebar again, and the new "Sources" item has the keyboard
 */
export function keepFocus(container: HTMLElement, redraw: () => void): void {
  const active = document.activeElement;

  if (active === null || active === container || !container.contains(active)) return redraw();

  // Where the element stands: the index of each of its ancestors among its siblings, from the container down.
  const path: number[] = [];
  let node: Element = active;

  while (node !== container) {
    const parent = node.parentElement;

    if (parent === null) break;

    path.unshift(Array.from(parent.children).indexOf(node));
    node = parent;
  }

  redraw();

  let standing: Element | undefined = container;

  for (const index of path) standing = standing?.children[index];

  // The page is not scrolled to it: the window puts the pane back where the person had scrolled it.
  if (standing instanceof HTMLElement && standing.tagName === active.tagName) standing.focus({ preventScroll: true });
}
