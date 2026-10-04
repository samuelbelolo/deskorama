import type { Language } from '@deskorama/core';
import type { DemoTheme } from './demo-themes.ts';
import type { DemoSource } from './sources/demo-source.ts';

/** What the visitor chose that restarts the scene when it changes. */
export interface Choice {
  readonly lang: Language;
  readonly source: DemoSource;
  readonly theme: DemoTheme;
  /** The hour of the day the demo's Clock jumps to. */
  readonly hour: number;
}
