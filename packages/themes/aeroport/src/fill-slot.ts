/**
 * Writes `text` as plain text into the slot of a drawing marked `data-slot="<name>"`; an Event string never
 * becomes markup.
 * @example
 * fillSlot(svgMarkup(flagMarkup(6)), 'tag', 'v2.5.0');
 */
export function fillSlot(drawing: Element, name: string, text: string): void {
  const slot = drawing.querySelector(`[data-slot="${name}"]`);
  if (slot !== null) slot.textContent = text;
}
