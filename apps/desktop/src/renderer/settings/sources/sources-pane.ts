import { element } from '../element.ts';
import { icon } from '../icon.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import type { WindowActions, WindowView } from '../window-view.ts';
import { catalogue } from './catalogue.ts';
import { sourceRow } from './source-row.ts';

/**
 * Returns the Sources pane. On first run, with no Source yet: what a Source is in one line, then the catalogue
 * first, and a way to the Local webhook for scripts. Once Sources exist: their grouped list, then the catalogue to
 * add more.
 * @example
 * sourcesPane(view, actions); // ["Connected", the list of Sources, "Add a Source", the catalogue]
 */
export function sourcesPane(view: WindowView, actions: WindowActions): Node[] {
  const { snapshot } = view;
  const { lang, connectors, sources } = snapshot;
  const text = SETTINGS_TEXT[lang];

  const services = catalogue(connectors, lang, actions.connect);

  if (sources.length === 0) {
    return [
      element('div', { className: 'welcome' }, [
        element('h2', { text: text.emptyTitle }),
        element('p', { text: text.emptyLead }),
      ]),
      services,
      element('p', { className: 'webhook-hint' }, [
        element('span', { text: text.emptyScript }),
        element(
          'button',
          { className: 'btn link', attributes: { type: 'button' }, onClick: () => actions.go('webhook') },
          [element('span', { text: text.emptyScriptLink }), icon('caret-right')],
        ),
      ]),
    ];
  }

  const rows = sources.flatMap((source) => {
    const connector = connectors.find((candidate) => candidate.id === source.connector);

    return connector === undefined ? [] : [sourceRow(source, connector, snapshot.now, lang, actions)];
  });

  return [
    element('h2', { className: 'section-title', text: text.connected }),
    element('div', { className: 'group' }, rows),
    element('h2', { className: 'section-title', text: text.addSource }),
    services,
  ];
}
