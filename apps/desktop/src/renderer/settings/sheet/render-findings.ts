import { GAUGE_ROLES, type Language } from '@deskorama/core';
import { shortTime } from '../../../shared/short-time.ts';
import type { ConnectorView } from '../../../shared/settings-snapshot.ts';
import type { TestFindings } from '../../../shared/source-draft.ts';
import { element } from '../element.ts';
import { roleIcon } from '../role-icon.ts';
import { ROLE_NAMES } from '../role-names.ts';
import { statusLine } from '../status-line.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';

/**
 * Returns what a passing test found, said for `where` (the repository, the project, the name): its latest Events,
 * each with the Role it plays; for a Source that sent no Event, the Gauge values it read under the Connector's own
 * words, as a Source that reports Gauges only always does; or that it answered with nothing yet.
 * @example
 * renderFindings({ events: [merged, approved, pushed], gauges: {} }, github, 'tramlo/tramlo-app', 'fr');
 * // ["tramlo/tramlo-app a répondu, voici ses 3 derniers événements.", the three Events]
 */
export function renderFindings(
  findings: TestFindings,
  connector: ConnectorView,
  where: string,
  lang: Language,
): Node[] {
  const text = SETTINGS_TEXT[lang];

  if (findings.events.length > 0) {
    const events = findings.events.map((event) => {
      const time = shortTime(event.at, lang);
      const meta = event.archetype === null ? time : text.sheetPlaysAs(time, ROLE_NAMES[event.archetype][lang]);

      return element('li', {}, [
        roleIcon(event.archetype),
        element('span', { className: 'found-text' }, [
          element('span', { className: 'found-label', text: event.label }),
          event.detail === '' ? null : element('span', { className: 'found-detail', text: event.detail }),
          element('span', { className: 'found-meta', text: meta }),
        ]),
      ]);
    });

    return [statusLine('ok', text.sheetFound(where, events.length)), element('ol', { className: 'found' }, events)];
  }

  const counted = GAUGE_ROLES.flatMap((role) => {
    const value = findings.gauges[role];

    return value === undefined ? [] : [{ label: connector.gauges[role].text[lang].label, value }];
  });

  if (counted.length === 0) return [statusLine('ok', text.sheetNoEvent(where))];

  const gauges = counted.map(({ label, value }) =>
    element('li', { className: 'counted' }, [
      element('span', { className: 'found-label', text: label }),
      element('span', { className: 'mono', text: value.toLocaleString(lang) }),
    ]),
  );

  return [statusLine('ok', text.sheetCounts(where)), element('ul', { className: 'found' }, gauges)];
}
