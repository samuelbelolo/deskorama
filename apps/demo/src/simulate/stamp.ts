import type { SourceEvent } from '@deskorama/core';

/** What makes one sent Event unique: its id within the Source, and when it happened. */
export type Stamp = Pick<SourceEvent, 'id' | 'at'>;
