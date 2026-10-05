import { pickedValues, type ConnectorField } from '@deskorama/core';
import { choiceOf } from '../../shared/choice-of.ts';
import { pickLimit } from '../../shared/pick-limit.ts';
import type { SourceDraft } from '../../shared/source-draft.ts';

/**
 * Returns true when a draft holds what one field of its Connector asks for: a typed value, an `https://` address
 * for a URL, one of the choices or a typed one where the field allows it, one picked value, or, for a field that
 * holds several, at least one unless none is allowed, and no more than its limit.
 * @example
 * fieldIsFilled({ key: 'url', kind: 'url', … }, { …, values: { url: 'http://x.example' } }); // false
 * fieldIsFilled({ key: 'projects', kind: 'pick-many', … }, { …, lists: { projects: ['prj_web'] } }); // true
 */
export function fieldIsFilled(field: ConnectorField, draft: Pick<SourceDraft, 'values' | 'lists'>): boolean {
  if (field.kind === 'pick-many') {
    const picked = pickedValues(draft, field.key, field.formerly);

    return (picked.length > 0 || field.none !== undefined) && picked.length <= pickLimit(field);
  }

  const value = (draft.values[field.key] ?? '').trim();

  if (field.kind === 'pick-one') return value !== '';

  if (field.kind === 'choice') {
    if (choiceOf(field, value) !== undefined) return true;

    return field.other !== undefined && isTyped(value, field.other.kind);
  }

  return isTyped(value, field.kind);
}

/**
 * Returns true for a typed value of its kind: any line that is not empty, or a well-formed `https://` address with
 * a host.
 * @example
 * isTyped('https://api.tramlo.example/events', 'url'); // true
 * isTyped('http://api.tramlo.example/events', 'url'); // false
 * isTyped('tramlo/tramlo-app', 'text'); // true
 */
function isTyped(value: string, kind: 'url' | 'text'): boolean {
  if (kind === 'text') return value !== '';

  try {
    const url = new URL(value);

    return url.protocol === 'https:' && url.hostname !== '';
  } catch {
    return false;
  }
}
