import { createFeed } from '@deskorama/connector-feed';
import type { Connector } from '@deskorama/core';

/** Every Connector a person can add from the settings window. */
export const CONNECTORS: readonly Connector[] = [createFeed()];
