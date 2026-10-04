import type { GagScript } from './gag-script.ts';
import { scriptedGags } from './scripted-gags.ts';
import type { Gag } from './stage.ts';

/**
 * Returns a Gag that plays one script: it waits for room, plays its actors in it and hangs its Caption on top.
 * @example
 * const playStamp: Gag = scriptedGag(STAMP_SCRIPT);
 */
export function scriptedGag(script: GagScript): Gag {
  return scriptedGags([script]);
}
