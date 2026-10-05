import { GAUGE_ROLES, type GaugeRole } from '@deskorama/core';
import type { SettingsSnapshot } from '../../../shared/settings-snapshot.ts';
import { popup } from '../controls/popup.ts';
import { row } from '../controls/row.ts';
import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';
import type { WindowActions } from '../window-view.ts';

/**
 * Returns the scene's choices, only once two Sources or more are connected: the Source that names the scene, then
 * for each Gauge the Source that feeds it, with what that Source counts in its Connector's own words. A Gauge
 * follows the Source naming the scene unless the person picks another for it.
 * @example
 * sceneGroup(snapshot, actions); // ["The scene", a group of four rows, a note]
 * sceneGroup(oneSourceOnly, actions); // []
 */
export function sceneGroup(snapshot: SettingsSnapshot, actions: Pick<WindowActions, 'setPreferences'>): Node[] {
  const { lang, sources, connectors, wallpaper } = snapshot;

  if (sources.length < 2) return [];

  const text = SETTINGS_TEXT[lang];
  const names = sources.map((source) => ({ value: source.id, label: source.name }));
  const brand = sources.find((source) => source.id === wallpaper.brand) ?? sources[0];

  /** What the Source `id` counts for a Gauge, as its Connector words it. */
  const counted = (id: string | undefined, role: GaugeRole): string | null => {
    const connector = sources.find((source) => source.id === id)?.connector;

    return connectors.find((candidate) => candidate.id === connector)?.gauges[role].text[lang].label ?? null;
  };

  const gauges = GAUGE_ROLES.map((role) => {
    const pinned = wallpaper.gauges[role];
    const options = [{ value: '', label: text.sameAsScene(brand?.name ?? '') }, ...names];

    return row(text.gaugeNames[role], counted(pinned ?? brand?.id, role), [
      popup(text.gaugeNames[role], options, pinned ?? '', (value) =>
        actions.setPreferences({ gauges: { [role]: value === '' ? null : value } }),
      ),
    ]);
  });

  return [
    element('h2', { className: 'section-title', text: text.scene }),
    element('div', { className: 'group' }, [
      row(text.brand, null, [
        popup(text.brand, names, brand?.id ?? '', (value) => actions.setPreferences({ brand: value })),
      ]),
      ...gauges,
    ]),
    element('p', { className: 'section-note', text: text.sceneNote }),
  ];
}
