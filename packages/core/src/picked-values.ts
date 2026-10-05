import type { SourceSettings } from './poll.ts';
import { tidyValues } from './tidy-values.ts';

/**
 * Returns the values a Source holds for a field that takes several, each once, trimmed, and none empty. A Source
 * saved when the field held a single value, under the key `formerly`, reads as a list of that one.
 * @example
 * pickedValues({ values: {}, lists: { projects: ['prj_web', ' prj_api ', 'prj_web'] } }, 'projects'); // ['prj_web', 'prj_api']
 * pickedValues({ values: { project: 'tramlo-web' } }, 'projects', 'project'); // ['tramlo-web']
 */
export function pickedValues(
  settings: Pick<SourceSettings, 'values' | 'lists'>,
  key: string,
  formerly?: string,
): string[] {
  const former = formerly === undefined ? undefined : settings.values[formerly];

  const kept = settings.lists?.[key] ?? (former === undefined ? [] : [former]);

  return tidyValues(kept);
}
