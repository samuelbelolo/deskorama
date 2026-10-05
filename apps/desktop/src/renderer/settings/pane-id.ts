/** The panes of the settings window, in the order the sidebar lists them. */
export const PANES = ['wallpaper', 'sources', 'try', 'webhook'] as const;

/** One pane of the settings window. */
export type PaneId = (typeof PANES)[number];
