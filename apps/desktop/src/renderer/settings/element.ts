/** What an element is created with. */
export interface ElementOptions {
  readonly className?: string;
  readonly text?: string;
  readonly attributes?: Readonly<Record<string, string>>;
  /**
   * CSS properties, custom ones included, set through the style object: the page's Content Security Policy refuses
   * a `style` attribute, and allows this.
   */
  readonly style?: Readonly<Record<string, string>>;
  readonly onClick?: (event: MouseEvent) => void;
}

/**
 * Returns a new element with a class, text, attributes and styles, and its children appended; a null child is
 * left out. Text is always set as text, never as HTML, so a Source's name or an Event's label can never inject
 * markup.
 * @example
 * element('button', { className: 'btn primary', text: 'Save', onClick: save });
 * element('ul', {}, items.map((item) => element('li', { text: item })));
 */
export function element<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  options: ElementOptions = {},
  children: readonly (Node | null)[] = [],
): HTMLElementTagNameMap[Tag] {
  const node = document.createElement(tag);

  if (options.className !== undefined) node.className = options.className;

  if (options.text !== undefined) node.textContent = options.text;

  for (const [name, value] of Object.entries(options.attributes ?? {})) node.setAttribute(name, value);

  for (const [name, value] of Object.entries(options.style ?? {})) node.style.setProperty(name, value);

  // Typed through HTMLElement: the tag's own event map is not known for a generic tag.
  if (options.onClick !== undefined) (node as HTMLElement).addEventListener('click', options.onClick);

  node.append(...children.filter((child) => child !== null));

  return node;
}
