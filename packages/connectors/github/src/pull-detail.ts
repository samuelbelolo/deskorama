import { clip } from './clip.ts';
import { DETAIL_LENGTH } from './limits.ts';
import type { Pull } from './pull-schema.ts';

/**
 * Returns the detail line of a pull request, or of a review on it: its number and title, never its author.
 * @example
 * pullDetail({ number: 412, title: 'Add PDF export for invoices', … }); // '#412 Add PDF export for invoices'
 */
export function pullDetail(pull: Pull): string {
  return clip(`#${pull.number} ${pull.title}`, DETAIL_LENGTH);
}
