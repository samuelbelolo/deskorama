/**
 * Returns the element matching `selector`, checked against the expected class; throws when the page lacks it.
 * @example
 * const picker = required(document, '#source', HTMLSelectElement); // the Source picker, typed as a <select>
 */
export function required<Kind extends Element>(
  page: ParentNode,
  selector: string,
  kind: abstract new () => Kind,
): Kind {
  const element = page.querySelector(selector);
  if (!(element instanceof kind)) throw new Error(`The demo page lacks ${selector}.`);
  return element;
}
