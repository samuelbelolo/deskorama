import { countedWords, type ConnectorOption, type Language, type PickManyField } from '@deskorama/core';
import { pickLimit } from '../../../shared/pick-limit.ts';
import { element } from '../element.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';

/** Past this many options, a field above the list narrows it. */
const FILTER_FROM = 9;

/** What a checklist is drawn from, and whom it tells. */
export interface PickChecklistOptions {
  readonly field: PickManyField;
  /** The options the service listed. */
  readonly listed: readonly ConnectorOption[];
  /** The values ticked when the list is drawn. */
  readonly picked: readonly string[];
  readonly lang: Language;
  /** Called with every ticked value, in the list's order, each time one changes. */
  readonly onChange: (picked: string[]) => void;
}

/** A checklist, and what goes beside its field's label. */
export interface PickChecklist {
  readonly list: HTMLElement;
  /** How many are ticked, in the Connector's own words, kept up to date. */
  readonly count: HTMLElement;
  /** The field that narrows a long list; null for a short one. */
  readonly filter: HTMLElement | null;
}

/**
 * Returns the options of a field that holds several as a list of checkboxes, with how many are ticked in the
 * Connector's own words, or what ticking none means. A value ticked before that the service no longer lists stays,
 * first and under its own name, so loading a list never drops what a Source follows. A long list comes with a
 * field that narrows it, and no more than the field's limit can be ticked.
 * @example
 * pickChecklist({ field: projects, listed: [web, api], picked: ['prj_web'], lang: 'en', onChange });
 * // list: [x] tramlo-web  [ ] tramlo-api, count: "1 project", filter: null
 */
export function pickChecklist(options: PickChecklistOptions): PickChecklist {
  const { field, lang } = options;
  const text = SETTINGS_TEXT[lang];

  const known = new Set(options.listed.map((option) => option.value));
  const kept = options.picked.filter((value) => !known.has(value)).map((value) => ({ value, label: value }));

  const rows = [...kept, ...options.listed].map((option) => {
    const box = element('input', { attributes: { type: 'checkbox', name: field.key, value: option.value } });

    box.checked = options.picked.includes(option.value);

    return {
      box,
      label: option.label,
      node: element('label', { className: 'pick-row' }, [box, element('span', { text: option.label })]),
    };
  });

  const count = element('span', { className: 'pick-count' });

  const said = (ticked: number): string => {
    if (ticked === 0) return field.none?.[lang] ?? text.pickAtLeastOne;

    return countedWords(field.counted[lang], ticked);
  };

  /** Says how many are ticked, and keeps the others from being ticked once the field's limit is reached. */
  const settle = (): string[] => {
    const ticked = rows.filter((row) => row.box.checked);
    const full = ticked.length >= pickLimit(field);

    for (const row of rows) row.box.disabled = full && !row.box.checked;

    count.textContent = said(ticked.length);

    return ticked.map((row) => row.box.value);
  };

  const list = element(
    'div',
    { className: 'pick-list', attributes: { role: 'group', 'aria-label': field.label[lang] } },
    rows.map((row) => row.node),
  );

  // On input rather than change, which comes after it: the sheet reads the ticks as soon as the input is heard.
  list.addEventListener('input', () => options.onChange(settle()));
  settle();

  const filter =
    rows.length < FILTER_FROM
      ? null
      : filterField(rows, text.pickFilter(field.label[lang]), text.pickFilterPlaceholder);

  return { list, count, filter };
}

/**
 * Returns the field that narrows a long list: a row stays while its name holds what is typed, whatever the case.
 * Typing here changes nothing a Source keeps, so the sheet is not told.
 * @example
 * filterField(rows, 'Filter: Vercel projects', 'Filter'); // typing "api" leaves "tramlo-api"
 */
function filterField(
  rows: readonly { readonly label: string; readonly node: HTMLElement }[],
  label: string,
  placeholder: string,
): HTMLElement {
  const filter = element('input', {
    className: 'field pick-filter',
    attributes: { type: 'search', spellcheck: 'false', 'aria-label': label, placeholder },
  });

  filter.addEventListener('input', (event) => {
    event.stopPropagation();

    const typed = filter.value.trim().toLowerCase();

    for (const row of rows) row.node.hidden = !row.label.toLowerCase().includes(typed);
  });

  return filter;
}
