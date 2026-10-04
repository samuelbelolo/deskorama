/**
 * Returns one of the Theme's phrases with its `{name}` placeholders filled; a placeholder with no value stays as it
 * is, so a missing value shows rather than vanishes.
 * @example
 * fillTemplate('{callsign}, cleared for take-off, runway 09.', { callsign: 'Prod flight v2.5.0' });
 * // "Prod flight v2.5.0, cleared for take-off, runway 09."
 */
export function fillTemplate(template: string, values: Readonly<Record<string, string>>): string {
  return template.replaceAll(/\{(\w+)\}/g, (placeholder, name: string) => values[name] ?? placeholder);
}
