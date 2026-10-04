/**
 * The Role of an Event, named `archetype` in code: the kind of thing that happened, on which a Theme reacts.
 * A Source maps each of its own event kinds onto one Role; a Theme never knows a Source's event kinds.
 */
export type Archetype =
  | 'arrival'
  | 'partner'
  | 'departure'
  | 'approval'
  | 'rejection'
  | 'abandon'
  | 'like'
  | 'celebration'
  | 'message'
  | 'publish'
  | 'usage'
  | 'money'
  | 'error'
  | 'blocked'
  | 'deploy';

/** Every Role, in a fixed order. */
export const ARCHETYPES: readonly Archetype[] = [
  'arrival',
  'partner',
  'departure',
  'approval',
  'rejection',
  'abandon',
  'like',
  'celebration',
  'message',
  'publish',
  'usage',
  'money',
  'error',
  'blocked',
  'deploy',
];
