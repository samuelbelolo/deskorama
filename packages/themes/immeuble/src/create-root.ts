import type { Language } from '@deskorama/core';
import type { Layout } from './layout.ts';
import { STYLES } from './styles.ts';

/**
 * Returns the building's root appended to `layer`: the size of its screen, in its display language, with its styles
 * and the description a screen reader announces for the whole picture.
 * @example
 * const root = createRoot(layer, layout, { lang: 'fr', description: copy.text.description });
 */
export function createRoot(
  layer: HTMLElement,
  layout: Layout,
  words: { readonly lang: Language; readonly description: string },
): HTMLElement {
  const root = document.createElement('div');
  root.className = 'immeuble-root';
  root.dataset['theme'] = 'immeuble';
  root.lang = words.lang;
  root.style.width = `${layout.width}px`;
  root.style.height = `${layout.height}px`;

  const style = document.createElement('style');
  style.textContent = STYLES;
  const description = document.createElement('p');
  description.className = 'immeuble-description';
  description.textContent = words.description;

  root.append(style, description);
  layer.append(root);

  return root;
}
