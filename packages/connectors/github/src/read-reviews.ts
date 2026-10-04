import { parsePayload, type SourceEvent } from '@deskorama/core';
import type { Activity } from './activity.ts';
import type { GithubSession } from './create-github-session.ts';
import type { Found } from './found.ts';
import { PULL_REQUESTS_PERMISSION } from './github-permissions.ts';
import { inSequence } from './in-sequence.ts';
import { lastPage } from './last-page.ts';
import type { Pull } from './pull-schema.ts';
import { reviewEvent } from './review-event.ts';
import { REVIEWS_SCHEMA, type Review } from './review-schema.ts';
import type { Scan } from './scan.ts';

/**
 * Reads the reviews of every pull request touched since the previous poll, since a review touches its pull
 * request, and returns those submitted since `scan.since`.
 * @example
 * await readReviews(session, [pull412], scan); // { events: [{ kind: 'review.approved', … }], activity: [ … ] }
 */
export async function readReviews(session: GithubSession, pulls: readonly Pull[], scan: Scan): Promise<Found> {
  const found = await inSequence(pulls, (pull) => readReviewsOf(session, pull, scan));

  return { events: found.flatMap((one) => one.events), activity: found.flatMap((one) => one.activity) };
}

/**
 * Reads the reviews of one pull request and returns those submitted since `scan.since`, with their reviewers.
 * @example
 * await readReviewsOf(session, pull418, scan); // { events: [{ id: 'review-9001', … }], activity: [{ id: 5004, at }] }
 */
async function readReviewsOf(session: GithubSession, pull: Pull, scan: Scan): Promise<Found> {
  const reviews = await readNewestReviews(session, pull.number);

  const events: SourceEvent[] = [];

  const activity: Activity[] = [];

  for (const review of reviews) {
    const event = reviewEvent(review, pull, scan);

    if (event === null) continue;

    events.push(event);

    if (review.user !== null) activity.push({ id: review.user.id, at: event.at.getTime() });
  }

  return { events, activity };
}

/**
 * Returns the reviews of a pull request that may be new: GitHub lists them oldest first, so past a hundred the
 * last page is read too. Read without ETag: the pull request changed, and an unchanged first page would hide a
 * new review on the last one.
 * @example
 * await readNewestReviews(session, 418); // [review9001, review9003]
 */
async function readNewestReviews(session: GithubSession, number: number): Promise<readonly Review[]> {
  const path = `/pulls/${number}/reviews?per_page=100`;

  const first = await session.get(path, PULL_REQUESTS_PERMISSION, { conditional: false });

  if (first.kind !== 'changed') return [];

  const reviews = await parsePayload(REVIEWS_SCHEMA, first.body, 'The reviews');

  const last = lastPage(first.headers.get('link'));

  if (last === null) return reviews;

  const answer = await session.get(`${path}&page=${last}`, PULL_REQUESTS_PERMISSION, { conditional: false });

  if (answer.kind !== 'changed') return reviews;

  return [...reviews, ...(await parsePayload(REVIEWS_SCHEMA, answer.body, 'The reviews'))];
}
