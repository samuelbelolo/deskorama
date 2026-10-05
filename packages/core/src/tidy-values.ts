/**
 * Returns values as a Source keeps them: each trimmed, none empty, each once, in the order they came.
 * @example
 * tidyValues([' prj_web ', 'prj_api', '', 'prj_web']); // ['prj_web', 'prj_api']
 */
export function tidyValues(values: readonly string[]): string[] {
  const filled = values.map((value) => value.trim()).filter((value) => value !== '');

  return [...new Set(filled)];
}
