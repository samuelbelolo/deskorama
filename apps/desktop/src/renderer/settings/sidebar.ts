import { element } from './element.ts';
import { icon, type IconName } from './icon.ts';
import { PANES, type PaneId } from './pane-id.ts';
import { sourceStanding } from './source-standing.ts';
import { SETTINGS_TEXT } from './text/text-by-language.ts';
import type { WindowView } from './window-view.ts';

/** The glyph of each pane. */
const PANE_ICONS: Readonly<Record<PaneId, IconName>> = {
  wallpaper: 'image',
  sources: 'plugs-connected',
  try: 'play-circle',
  webhook: 'terminal-window',
};

/**
 * Returns the sidebar's content: room for the window's own traffic lights, the four panes with the current one
 * marked, a red count on Sources when some need the person, and a quiet line on how many Sources the Mac reads.
 * @example
 * sidebar(view, go); // [the title bar's room, 4 items with "Sources 1", "3 Sources read from this Mac"]
 */
export function sidebar(view: WindowView, go: (pane: PaneId) => void): Node[] {
  const { lang, sources } = view.snapshot;
  const text = SETTINGS_TEXT[lang];

  const failing = sources.filter((source) => sourceStanding(source.status, lang).kind === 'bad').length;

  const items = PANES.map((pane) =>
    element(
      'button',
      {
        className: 'side-item',
        attributes: { type: 'button', 'data-pane': pane, ...(pane === view.pane ? { 'aria-current': 'page' } : {}) },
        onClick: () => go(pane),
      },
      [
        icon(PANE_ICONS[pane]),
        element('span', { className: 'label', text: text.panes[pane] }),
        pane === 'sources' && failing > 0 ? element('span', { className: 'badge', text: String(failing) }) : null,
      ],
    ),
  );

  return [
    element('div', { className: 'titlebar-room' }),
    element('nav', { className: 'side-nav' }, items),
    element('p', { className: sources.length > 0 ? 'side-foot reading' : 'side-foot' }, [
      icon('circle-fill'),
      element('span', { text: text.reading(sources.length) }),
    ]),
  ];
}
