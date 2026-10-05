import type { Archetype } from '@deskorama/core';

/** One group of Roles, by what they say about the work. */
export type RoleGroupId = 'people' | 'work' | 'reactions' | 'money' | 'shipping';

/** One group of Roles as the Try pane lays it out. */
export interface RoleGroup {
  readonly id: RoleGroupId;
  /** Which of the pane's two columns holds it; a column fills top to bottom, in the order of the groups. */
  readonly column: 'left' | 'right';
  readonly roles: readonly Archetype[];
}

/** The groups the Roles are tried in, in the order the pane reads them; every Role is in exactly one. */
export const ROLE_GROUPS: readonly RoleGroup[] = [
  { id: 'people', column: 'left', roles: ['arrival', 'partner', 'departure'] },
  { id: 'work', column: 'left', roles: ['approval', 'rejection', 'abandon'] },
  { id: 'reactions', column: 'right', roles: ['like', 'message', 'celebration'] },
  { id: 'money', column: 'right', roles: ['money', 'blocked', 'error'] },
  { id: 'shipping', column: 'left', roles: ['usage', 'publish', 'deploy'] },
];

/** The Roles a Source seldom sends, marked so in the list. */
export const RARE_ROLES: readonly Archetype[] = ['celebration'];
