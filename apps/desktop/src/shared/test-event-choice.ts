import { ARCHETYPES, type Archetype } from '@deskorama/core';

/** A test Event the settings window plays: one per Role, and the failed deploy, the one legendary scene. */
export type TestEventChoice = Archetype | 'failed-deploy';

/** Every test Event, in the order the settings window offers them. */
export const TEST_EVENT_CHOICES: readonly TestEventChoice[] = [...ARCHETYPES, 'failed-deploy'];
