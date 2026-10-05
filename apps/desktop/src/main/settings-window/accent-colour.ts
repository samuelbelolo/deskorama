/**
 * Returns the Mac's accent colour as a CSS `#rrggbb`, from the RGBA hexadecimal form macOS gives with or without a
 * leading `#`, or null when it is not one, so the window keeps its default.
 * @example
 * accentColour('007AFFFF'); // '#007aff'
 * accentColour('not a colour'); // null
 */
export function accentColour(system: string): string | null {
  const match = /^#?([0-9a-f]{6})(?:[0-9a-f]{2})?$/i.exec(system.trim());

  return match?.[1] === undefined ? null : `#${match[1].toLowerCase()}`;
}
