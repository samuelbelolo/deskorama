import { GOLDEN_RUNWAY } from './golden-runway-script.ts';
import { GOLDEN_SKY } from './golden-sky-script.ts';
import { scriptedGags } from './scripted-gags.ts';
import type { Gag } from './stage.ts';

/**
 * celebration: a milestone, the rarest good news. The golden jet, the only gold on the poster and more than twice the
 * size of any other plane, draws a heart in a free patch of sky; when no sky shows, it paints the heart on the runway
 * and lands on an orange carpet. It waits up to a minute for room rather than play small.
 * @example
 * director.play(milestoneEvent); // through gagFor(event) === playCelebration
 */
export const playCelebration: Gag = scriptedGags([GOLDEN_SKY, GOLDEN_RUNWAY]);
