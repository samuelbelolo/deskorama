import type { Legend } from './sprite.ts';

/**
 * Tenants, by pose. Letters: h hair, s skin, e eyes, c shirt, p trousers, k shoes, m mug, g phone glow, b box.
 * Hair, shirt, trousers and skin are filled per tenant (see `tenantLegend`).
 */
export const TENANT_POSES = {
  FRONT: ['.hhh.', 'hhhhh', 'heseh', '.sss.', '.ccc.', 'ccccc', 'scccs', '.ppp.', '.p.p.', '.k.k.'],
  WALK_A: ['.hhh.', 'hhhhh', 'hhses', '.sss.', '.ccc.', '.ccc.', '.cs..', '.pp..', 'p..p.', 'k...k'],
  WALK_B: ['.hhh.', 'hhhhh', 'hhses', '.sss.', '.ccc.', '.ccc.', '..cs.', '.pp..', '.pp..', '.kk..'],
  MUG: ['.hhh..', 'hhhhh.', 'heseh.', '.sss..', '.ccc..', 'ccccsm', 'sccc.m', '.ppp..', '.p.p..', '.k.k..'],
  PHONE: ['.hhh.', 'hhhhh', 'hsssh', '.sss.', '.ccc.', 'csgsc', 'c.g.c', '.ppp.', '.p.p.', '.k.k.'],
  ARMS_UP: ['s...s', 's.h.s', 'shhhs', 'heseh', 'csssc', '.ccc.', '.ccc.', '.ppp.', 'p...p', 'k...k'],
  SIT: ['.hhh.', 'hhhhh', 'heseh', '.sss.', '.ccc.', 'ccccc', 'scccs', '.pppp', '.p..p', '.k..k'],
} as const;

/** The name of a tenant pose. */
export type Pose = keyof typeof TENANT_POSES;

/** The building's regulars and visitors, drawn with {@link CAST_LEGEND}. */
export const CAST = {
  CONCIERGE: [
    '..tt..',
    '.tttt.',
    'tttttt',
    'tesest',
    '.ssss.',
    '.mmmm.',
    'mmmmmm',
    'smppms',
    '.mppm.',
    '.mmmm.',
    '.k..k.',
  ],
  CONCIERGE_FACEPALM: [
    '..tt...',
    '.tttt..',
    'tttttt.',
    'tssssm.',
    '.ssssm.',
    '.mmmmm.',
    'mmmmmm.',
    'smppm..',
    '.mppm..',
    '.mmmm..',
    '.k..k..',
  ],
  CONCIERGE_SLEEP: [
    '......',
    '..tt..',
    '.tttt.',
    'tttttt',
    'teseet',
    '.ssss.',
    'mmmmmm',
    'smmmms',
    'mmmmmm',
    '.mmmm.',
    '.k..k.',
  ],
  WORKER_A: ['.lll.', 'lllll', 'seses', '.sss.', '.ooo.', 'ooooo', 'sooos', '.ddd.', 'd...d', 'k...k'],
  WORKER_B: ['.lll.', 'lllll', 'seses', '.sss.', '.ooo.', 'ooooo', 'sooos', '.ddd.', '.d.d.', '.k.k.'],
  WORKER_CHEER: ['s.l.s', 'sllls', 'sllls', '.ese.', '.sss.', 'ooooo', '.ooo.', '.ddd.', 'd...d', 'k...k'],
  ROBOT: ['...l...', '...e...', '.eeeee.', '.ehlhe.', '.eeeee.', 'ezzzzze', 'ezhzhze', 'ezzzzze', '.ee.ee.'],
  ROBOT_SMOKE: ['.h.h...', '..h....', '.eeeee.', '.eeeee.', '.eeeee.', 'ezzzzze', 'ezhzhze', 'ezzzzze', '.ee.ee.'],
  POSTMAN: ['.ddd.', 'ddddd', '.ses.', '.sss.', '.ddd.', 'dddww', 'sdddw', '.ddd.', '.d.d.', '.k.k.'],
  COURIER: ['.ooo.', 'ooooo', '.ses.', '.sss.', '.xxx.', 'xxxxx', 'sxxxs', '.eee.', '.e.e.', '.k.k.'],
  VIP: ['.eee.', '.eee.', 'eeeee', 'seses', '.sss.', '.xxx.', 'xxxxx', 'sxxxs', '.xxx.', '.x.x.', '.e.e.'],
} as const;

/** The name of a cast sprite. */
export type CastName = keyof typeof CAST;

/** The letters of the cast sprites. */
export const CAST_LEGEND: Legend = {
  t: 'stone2',
  s: 'skin',
  e: 'ink',
  k: 'ink',
  m: 'moss',
  p: 'paper',
  l: 'lamp',
  o: 'dawn',
  d: 'denim',
  z: 'zinc',
  f: 'leaf',
  h: 'haze',
  x: 'slate',
  w: 'wood',
};
