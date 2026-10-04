import type { Legend } from './sprite.ts';

/** The letters every furniture and prop pixel map uses. */
export const LEGEND: Legend = {
  k: 'ink',
  w: 'wood',
  u: 'umber',
  s: 'stone',
  t: 'stone2',
  p: 'paper',
  l: 'lamp',
  g: 'glow',
  f: 'leaf',
  m: 'moss',
  d: 'denim',
  z: 'zinc',
  e: 'slate',
  n: 'night',
  h: 'haze',
  o: 'dawn',
  r: 'litwall',
  a: 'accent',
  c: 'dusk',
  i: 'skin',
};

/** Room furniture and ground-floor fittings, drawn with {@link LEGEND}. */
export const FURNITURE = {
  BED: ['u.............', 'u.............', 'uppddddddddddd', 'uuuuuuuuuuuuuu', 'u............u'],
  SOFA: ['.mmmmmmmmm.', '.mmmmmmmmm.', 'mmfffffffmm', 'mmmmmmmmmmm', 'k.........k'],
  TABLE: ['.......w.', '.......w.', 'wwwwwwwww', '.u.....w.', '.u....ww.', '.u....w.w'],
  SHELF: ['uuuuuu', 'udflou', 'udflou', 'uuuuuu', 'uoddfu', 'uoddfu', 'uuuuuu', 'ulfodu', 'ulfodu', 'uuuuuu', 'u....u'],
  PLANT: ['.f.f.', 'fmfmf', '.fmf.', '..m..', '.uuu.', '.uuu.'],
  FLOOR_LAMP: ['.lll.', 'lgggl', '..k..', '..k..', '..k..', '..k..', '..k..', '..k..', '.kkk.'],
  TV_OFF: ['kkkkkkk', 'knnnnnk', 'knnnnnk', 'kkkkkkk', '.wwwww.', '.w...w.'],
  TV_ON: ['kkkkkkk', 'khhddhk', 'kdhhhdk', 'kkkkkkk', '.wwwww.', '.w...w.'],
  FRIDGE: ['hhhhhh', 'hzzzzh', 'hhhhhh', 'hhhhzh', 'hhhhzh', 'hhhhhh', 'hhhhhh', 'hhhhhh', 'hhhhhh', 'zzzzzz'],
  DESK: ['..kkkk.', '..khhk.', '..kkkk.', '...k...', 'wwwwwww', 'w.....w', 'w.....w'],
  FRAME: ['uuuuu', 'uhfhu', 'ufffu', 'uuuuu'],
  PRINTER: ['.pppp.', 'kzzzzk', 'kzzlzk', 'kkkkkk', 'uuuuuu', 'u....u', 'u....u'],
  BAGUETTES: ['.o..o..o.', '.o.oo.oo.', 'oo.o..o..', 'uuuuuuuuu', 'u.......u', 'uuuuuuuuu'],
  COFFEE_MACHINE: ['zzzzzz', 'zkzzkz', 'z.zz.z', 'zzzzzz'],
  FLOWERS: ['l.o.g.l', 'flfofgf', '.fmfmf.', '..zzz..', '..zzz..'],
  NEWSPAPERS: ['pppkppp', 'pkkkpkk', 'pppkppp', 'pkkkpkk', 'uuuuuuu', 'u.....u'],
  NOTICE: ['ppppp', 'pp.pp', 'p...p', 'p.k.p', 'ppppp'],
  KEYS: ['k.k.k.k', 'l.l.l.l', 'l...l.l'],
  BIN: ['.llllll.', 'kkkkkkkk', '.mmmmmm.', '.mfmmfm.', '.mmmmmm.', '.mmmmmm.', '.k....k.'],
} as const;

/** The name of a furniture pixel map. */
export type FurnitureName = keyof typeof FURNITURE;
