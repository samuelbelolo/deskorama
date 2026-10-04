/** Where the construction site stands. */
type SitePhase = 'idle' | 'building' | 'delivering' | 'failed';

/** The crane's state: its phase, where it stands and where it rolls to, and what the sign says. */
export interface SiteState {
  phase: SitePhase;
  /** The Clock time the phase began. */
  since: number;
  /** The tower's x, and where it rolls to, in native pixels. */
  cx: number;
  targetX: number;
  /** When the last deploy went live and its tag, for the sign; null before any. */
  delivery: { readonly time: string; readonly tag: string } | null;
  /** The Clock time of the last failed deploy this screen knows of; null when it knows none. */
  failedAt: number | null;
}
