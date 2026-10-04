import type { SourceEvent } from '@deskorama/core';
import { eventText } from './event-text.ts';
import { githubEvent } from './github-event.ts';
import { pullDetail } from './pull-detail.ts';
import type { Pull } from './pull-schema.ts';
import type { Review } from './review-schema.ts';
import type { Scan } from './scan.ts';

/**
 * Returns the Event of a review submitted since `scan.since`: an approval is a thumbs-up, a request for changes a
 * rejection; a comment, a dismissal or a pending review is no Event.
 * @example
 * reviewEvent({ id: 9001, state: 'APPROVED', submitted_at: t, … }, pull, scan);
 * // { kind: 'review.approved', archetype: 'like', text: { en: { tag: 'LGTM', … } }, … }
 */
export function reviewEvent(review: Review, pull: Pull, scan: Scan): SourceEvent | null {
  if (review.submitted_at === null || review.submitted_at <= scan.since) return null;

  const detail = pullDetail(pull);

  const common = { id: `review-${review.id}`, at: review.submitted_at };

  if (review.state === 'APPROVED') {
    return githubEvent(scan.source, {
      ...common,
      kind: 'review.approved',
      archetype: 'like',
      rarity: 'notable',
      text: eventText({ fr: 'Revue approuvée', en: 'Review approved' }, detail, 'LGTM'),
    });
  }

  if (review.state === 'CHANGES_REQUESTED') {
    return githubEvent(scan.source, {
      ...common,
      kind: 'review.changes_requested',
      archetype: 'rejection',
      rarity: 'common',
      text: eventText({ fr: 'Modifications demandées', en: 'Changes requested' }, detail, {
        fr: 'À REVOIR',
        en: 'CHANGES',
      }),
    });
  }

  return null;
}
