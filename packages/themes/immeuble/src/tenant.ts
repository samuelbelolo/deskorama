import type { Pose } from './people-sprites.ts';
import type { Room } from './room.ts';

/** Someone at home: the room they light, where they stand and where they are heading, and how they look. */
export interface Tenant {
  readonly room: Room;
  x: number;
  targetX: number;
  dir: 1 | -1;
  /** Counts steps, for the walk cycle. */
  frame: number;
  pose: Pose;
  /** The Clock time of their next step or stroll. */
  nextAt: number;
  /** They jump with their arms up until this Clock time. */
  cheerUntil: number;
  readonly look: number;
}
