import type { ConnectorOption, Language, PickManyField, PickOneField } from '@deskorama/core';
import { pickLimit } from '../../../shared/pick-limit.ts';
import { element } from '../element.ts';
import { pickBody, type PickState } from './pick-body.ts';

/** One field of a connection sheet picked from what the token can see. */
export interface PickField {
  readonly field: PickOneField | PickManyField;
  readonly node: HTMLElement;
  /** The values picked or typed so far: one at most for a field that holds one. */
  readonly values: () => string[];
  /** True once the field holds what it must: a value, or none where none stands for all, and no more than its limit. */
  readonly filled: () => boolean;
  /** Draws where the list stands, keeping what is picked. */
  readonly show: (state: PickState) => void;
  /** Forgets what is picked: it belonged to what the field depended on, which changed. */
  readonly clear: () => void;
  /** Marks the field as needing a fix, or clears the mark. */
  readonly mark: (invalid: boolean) => void;
}

/**
 * Returns a field picked from what the token can see, its label above it, holding `start`, which draws each state
 * of its list and keeps what is picked from one to the next. A value held before that matches the name of a loaded
 * option becomes that option, so a Source saved with a typed name opens with it picked. A value typed beside a
 * loaded list that lacks it is kept and shown picked, and the sheet hears of it as of any other change.
 * @example
 * const projects = pickField(projectsField, ['tramlo-web'], 'en');
 * projects.show({ kind: 'loaded', options: [{ value: 'prj_web', label: 'tramlo-web' }] });
 * projects.values(); // ['prj_web']
 */
export function pickField(field: PickOneField | PickManyField, start: readonly string[], lang: Language): PickField {
  let picked = [...start];
  // The state last drawn, which is drawn again once a value its list lacks is added.
  let shown: PickState | null = null;

  const body = element('div', { className: 'pick-body', attributes: { 'aria-live': 'polite' } });
  const aside = element('span', { className: 'pick-aside' });
  const label = element('span', { className: 'form-label', text: field.label[lang] });

  const node = element('div', { className: 'pick', attributes: { 'data-pick': field.key } }, [
    element('div', { className: 'pick-head' }, [label, aside]),
    body,
  ]);

  const keep = (values: string[]): void => {
    picked = values;
  };

  const show = (state: PickState): void => {
    shown = state;

    if (state.kind === 'loaded') picked = asListed(picked, state.options);

    const drawn = pickBody(state, { field, picked, lang, onChange: keep, onAdd: add });

    body.replaceChildren(...drawn.body);
    aside.replaceChildren(...drawn.aside);
  };

  /** Keeps a value typed beside the loaded list, shows it picked, and tells the sheet, which hears `input` only. */
  const add = (value: string, again: boolean): void => {
    const held = withAdded(field, picked, value);

    if (held === null || shown === null) return;

    picked = held;
    show(shown);

    // The line the value was typed in went with the list drawn before: the new one takes the keyboard.
    if (again) body.querySelector<HTMLElement>('.pick-unlisted input')?.focus();

    node.dispatchEvent(new Event('input', { bubbles: true }));
  };

  return {
    field,
    node,
    values: () => picked,
    filled: () => holdsEnough(field, picked),
    show,
    clear: () => keep([]),
    mark: (invalid) => node.setAttribute('data-invalid', String(invalid)),
  };
}

/**
 * Returns true once a field holds what it must: a value, or none where none stands for all, and, for a field that
 * holds several, no more than its limit.
 * @example
 * holdsEnough(organization, []); // false
 * holdsEnough(sentryProjects, []); // true: none stands for all
 * holdsEnough(vercelProjects, twentyOneIds); // false: Vercel takes 20 at most
 */
function holdsEnough(field: PickOneField | PickManyField, picked: readonly string[]): boolean {
  if (field.kind === 'pick-one') return picked.length > 0;

  return (picked.length > 0 || field.none !== undefined) && picked.length <= pickLimit(field);
}

/**
 * Returns what a field holds once a value typed beside its list is added: it replaces the value of a field that
 * holds one, and joins those of a field that holds several unless it is among them already. Null when the field is
 * at its limit, so nothing is taken.
 * @example
 * withAdded(organization, ['tramlo'], 'kavelo-labs'); // ['kavelo-labs']
 * withAdded(projects, ['prj_web'], 'prj_docs'); // ['prj_web', 'prj_docs']
 * withAdded(vercelProjects, twentyIds, 'prj_docs'); // null
 */
function withAdded(field: PickOneField | PickManyField, picked: readonly string[], value: string): string[] | null {
  if (field.kind === 'pick-one') return [value];

  if (picked.includes(value)) return [...picked];

  return picked.length < pickLimit(field) ? [...picked, value] : null;
}

/**
 * Returns the values held as the loaded options word them: one that is the name of an option becomes that option's
 * value, the others stay, and none comes twice.
 * @example
 * asListed(['tramlo-web', 'prj_api'], [{ value: 'prj_web', label: 'tramlo-web' }]); // ['prj_web', 'prj_api']
 */
function asListed(picked: readonly string[], options: readonly ConnectorOption[]): string[] {
  const values = new Set(options.map((option) => option.value));

  const listed = picked.map((value) => {
    if (values.has(value)) return value;

    return options.find((option) => option.label === value)?.value ?? value;
  });

  return [...new Set(listed)];
}
