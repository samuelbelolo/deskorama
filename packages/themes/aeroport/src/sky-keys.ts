/** The tints of the poster that follow the hour: the four sky rings, the far hills, the ground and the buildings. */
export const TINT_NAMES = [
  'sky1',
  'sky2',
  'sky3',
  'sky4',
  'far',
  'cloud',
  'apron',
  'tarmac',
  'grass',
  'facade',
  'glass',
  'sun',
] as const;

/** One tint of the poster. */
export type TintName = (typeof TINT_NAMES)[number];

/** The poster's tints at one hour of the day. */
export type Tints = Readonly<Record<TintName, string>>;

/** Night tints, from 22:30 to 5:00. */
const NIGHT: Tints = {
  sky1: '#111a2b',
  sky2: '#16223a',
  sky3: '#1c2b45',
  sky4: '#253753',
  far: '#1f2d44',
  cloud: '#26344d',
  apron: '#3a4250',
  tarmac: '#262c36',
  grass: '#2b3d3c',
  facade: '#566273',
  glass: '#1d2a3c',
  sun: '#e9e6d6',
};

/**
 * Poster keyframes by hour: night navy, dawn rose, morning pale cobalt, afternoon cobalt, sunset amber, dusk.
 * The first and last frames are equal, so the day wraps around midnight without a jump.
 */
export const SKY_KEYS: readonly { readonly hour: number; readonly tints: Tints }[] = [
  { hour: 0, tints: NIGHT },
  {
    hour: 5,
    tints: {
      ...NIGHT,
      sky1: '#131d31',
      sky2: '#1a2843',
      sky3: '#24365a',
      sky4: '#34496a',
      far: '#26354f',
      cloud: '#2c3b56',
      apron: '#3d4553',
      tarmac: '#282e38',
      grass: '#2e403f',
      facade: '#5a6677',
      glass: '#1f2c3e',
    },
  },
  {
    hour: 6.5,
    tints: {
      sky1: '#3f5d8a',
      sky2: '#a58e98',
      sky3: '#e2b39b',
      sky4: '#f1d0b0',
      far: '#7c879c',
      cloud: '#e9d6cb',
      apron: '#9aa0a4',
      tarmac: '#474e58',
      grass: '#6c8a79',
      facade: '#c4c8c7',
      glass: '#8aa0b6',
      sun: '#f6cf9c',
    },
  },
  {
    hour: 8,
    tints: {
      sky1: '#6fa2d2',
      sky2: '#9fc3df',
      sky3: '#cfe0e8',
      sky4: '#ece6d6',
      far: '#a1b5c6',
      cloud: '#eef1ec',
      apron: '#c3cac6',
      tarmac: '#4a515b',
      grass: '#7e9f8b',
      facade: '#e6e9e3',
      glass: '#a7c1d4',
      sun: '#f7e6c4',
    },
  },
  {
    hour: 13,
    tints: {
      sky1: '#5d9ad2',
      sky2: '#8cbbe1',
      sky3: '#bcd7eb',
      sky4: '#dbe8ed',
      far: '#a6bccd',
      cloud: '#eef1ec',
      apron: '#c3cac6',
      tarmac: '#4a515b',
      grass: '#7e9f8b',
      facade: '#e9ece6',
      glass: '#9fbdd3',
      sun: '#f6ecd3',
    },
  },
  {
    hour: 17.5,
    tints: {
      sky1: '#5287be',
      sky2: '#9db8cf',
      sky3: '#e9cfa9',
      sky4: '#f2dcb4',
      far: '#9ea8b4',
      cloud: '#f1e6d6',
      apron: '#c2c3bd',
      tarmac: '#4a505a',
      grass: '#7a977e',
      facade: '#ece4d4',
      glass: '#a1b4c4',
      sun: '#f6d7a0',
    },
  },
  {
    hour: 19.5,
    tints: {
      sky1: '#2f4c7c',
      sky2: '#9a7f86',
      sky3: '#e09a6f',
      sky4: '#f0bd80',
      far: '#5d6880',
      cloud: '#e7b597',
      apron: '#9c9a98',
      tarmac: '#3f4550',
      grass: '#5d7568',
      facade: '#c9b9aa',
      glass: '#7d8ba0',
      sun: '#f2b07a',
    },
  },
  {
    hour: 21,
    tints: {
      sky1: '#19253d',
      sky2: '#283a5a',
      sky3: '#465677',
      sky4: '#646883',
      far: '#2c3a53',
      cloud: '#3a4864',
      apron: '#4b525e',
      tarmac: '#2c323c',
      grass: '#33463f',
      facade: '#68717f',
      glass: '#2a3a52',
      sun: '#e9e6d6',
    },
  },
  { hour: 22.5, tints: NIGHT },
  { hour: 24, tints: NIGHT },
];
