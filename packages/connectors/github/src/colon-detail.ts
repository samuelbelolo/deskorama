import { clip } from './clip.ts';
import type { Words } from './event-text.ts';
import { DETAIL_LENGTH } from './limits.ts';

/**
 * Returns a detail made of two parts joined by a colon, spaced the way each language spaces it.
 * @example
 * colonDetail('v2.5.0', 'PDF export'); // { fr: 'v2.5.0 : PDF export', en: 'v2.5.0: PDF export' }
 */
export function colonDetail(left: string, right: string): Words {
  return { fr: clip(`${left} : ${right}`, DETAIL_LENGTH), en: clip(`${left}: ${right}`, DETAIL_LENGTH) };
}
