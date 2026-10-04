/**
 * Returns a new element with a class, appended to `parent`.
 * @example
 * element('span', 'aeroport-board-title', band).textContent = 'Départs';
 */
export function element(tag: string, className: string, parent: HTMLElement): HTMLElement {
  const node = document.createElement(tag);
  if (className !== '') node.className = className;
  parent.append(node);

  return node;
}
