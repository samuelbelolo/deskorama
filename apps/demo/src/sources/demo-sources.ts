import { BAILIX } from './bailix.ts';
import type { DemoSource } from './demo-source.ts';
import { KAVELO } from './kavelo.ts';
import { TRAMLO } from './tramlo.ts';
import { TRAMLO_KIT } from './tramlo-kit.ts';

/**
 * The fictional Sources the visitor picks from, in menu order. The private repository comes first: it is the usual
 * case at work and the easiest to picture, so the demo opens on it.
 */
export const DEMO_SOURCES: readonly [DemoSource, ...DemoSource[]] = [TRAMLO, TRAMLO_KIT, KAVELO, BAILIX];
