/** The attributes and text an element is created with. */
export interface ElementOptions {
  readonly className?: string;
  readonly text?: string;
  readonly attributes?: Readonly<Record<string, string>>;
}

/**
 * Returns a new element with a class, text and attributes, and its children appended. Text is always set as text,
 * never as HTML, so a Source's name or an Event's label can never inject markup.
 * @example
 * element('button', { className: 'primary', text: 'Save' });
 * element('ul', {}, items.map((item) => element('li', { text: item })));
 */
export function element<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  options: ElementOptions = {},
  children: readonly Node[] = [],
): HTMLElementTagNameMap[Tag] {
  const node = document.createElement(tag);

  if (options.className !== undefined) node.className = options.className;

  if (options.text !== undefined) node.textContent = options.text;

  for (const [name, value] of Object.entries(options.attributes ?? {})) node.setAttribute(name, value);

  node.append(...children);

  return node;
}
