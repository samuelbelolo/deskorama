/**
 * Returns `text` cut to at most `max` characters, ending with an ellipsis when it was longer.
 * @example
 * clip('production-eu-west', 12); // 'production-…'
 * clip('v2.5.0', 12); // 'v2.5.0'
 */
export function clip(text: string, max: number): string {
  const characters = Array.from(text);

  if (characters.length <= max) return text;

  return `${characters.slice(0, max - 1).join('')}…`;
}
