/**
 * Returns the building's root in a layer.
 * @example
 * rootOf(layer).dataset['theme']; // "immeuble"
 */
export function rootOf(layer: HTMLElement): HTMLElement {
  const root = layer.querySelector<HTMLElement>('[data-theme="immeuble"]');
  if (root === null) throw new Error('The building is not mounted.');

  return root;
}
