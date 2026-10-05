import type { PaneId } from './pane-id.ts';

/** The panes visited, so the toolbar's arrows go back and forward as in System Settings. */
export interface PaneHistory {
  readonly current: () => PaneId;
  readonly canGoBack: () => boolean;
  readonly canGoForward: () => boolean;
  /** Visits a pane: what was ahead is forgotten. Visiting the current pane changes nothing. */
  visit(pane: PaneId): void;
  back(): void;
  forward(): void;
}

/**
 * Returns the history of the panes visited, starting on `first`.
 * @example
 * const history = createPaneHistory('sources');
 * history.visit('webhook');
 * history.back();
 * history.current(); // 'sources'
 */
export function createPaneHistory(first: PaneId): PaneHistory {
  const behind: PaneId[] = [];
  const ahead: PaneId[] = [];
  let current = first;

  /** Moves one step from a stack to the current pane, pushing the current pane onto the other stack. */
  const step = (from: PaneId[], onto: PaneId[]): void => {
    const next = from.pop();

    if (next === undefined) return;

    onto.push(current);
    current = next;
  };

  return {
    current: () => current,
    canGoBack: () => behind.length > 0,
    canGoForward: () => ahead.length > 0,

    visit(pane) {
      if (pane === current) return;

      behind.push(current);
      ahead.length = 0;
      current = pane;
    },

    back: () => step(behind, ahead),
    forward: () => step(ahead, behind),
  };
}
