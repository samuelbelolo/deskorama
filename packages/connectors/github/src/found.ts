import type { SourceEvent } from '@deskorama/core';
import type { Activity } from './activity.ts';

/** What one reader found: Events, and who was active when, for the crowd Gauge. */
export interface Found {
  readonly events: readonly SourceEvent[];
  readonly activity: readonly Activity[];
}
