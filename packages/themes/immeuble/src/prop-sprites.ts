/** Pixel maps of the Gags' props, drawn with the furniture legend. */
export const PROPS = {
  HEART: ['.kk.kk.', 'kaakaak', 'kaaaaak', '.kaaak.', '..kak..', '...k...'],
  COIN: ['.ll.', 'lgll', 'llll', '.ll.'],
  SPARK: ['l.l', '.g.', 'l.l'],
  CRATE: [
    'kkkkkkkkkk',
    'kwuuuuuuwk',
    'kuwuuuuwuk',
    'kuuwuuwuuk',
    'kuuuwwuuuk',
    'kuuwuuwuuk',
    'kuwuuuuwuk',
    'kkkkkkkkkk',
  ],
  RUBBLE: ['....tt.....', '..ttsst.u..', '.tssuttssu.', 'tsstuusstst'],
  PLANK: ['wwwwwwwwwwww', 'uuuuuuuuuuuu'],
  TRICYCLE: [
    '........kkkkkkkk',
    '........kuuuuuuk',
    '..kk....kuuuuuuk',
    '..kd....kuuuuuuk',
    '.kdddk..kuuuuuuk',
    '.kddkkkkkkkkkkkk',
    '..kk..kk....kk..',
    '.kzzk.kzk..kzzk.',
    '..kk...k....kk..',
  ],
  THUMB_DOWN: [
    'dkkkkkkkk.',
    'dksssssssk',
    'dkssssssk.',
    'dksssssssk',
    'dkssssssk.',
    'dkkksskkk.',
    '...ksk....',
    '...ksk....',
    '...ksk....',
    '....k.....',
  ],
} as const;

/** The name of a prop pixel map. */
export type PropName = keyof typeof PROPS;
