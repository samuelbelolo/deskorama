/**
 * Returns a template with its `{name}` slots filled; a slot with no value is left empty.
 * @example
 * fillTemplate('SUR {brand}', { brand: 'TRAMLO' }); // "SUR TRAMLO"
 */
export function fillTemplate(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}
