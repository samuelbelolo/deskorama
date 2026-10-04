import type { SourceEvent } from '@deskorama/core';
import { clip } from './clip.ts';
import { colonDetail } from './colon-detail.ts';
import { eventText } from './event-text.ts';
import { githubEvent } from './github-event.ts';
import { TAG_LENGTH } from './limits.ts';
import type { Release } from './release-schema.ts';
import type { Scan } from './scan.ts';

/**
 * Returns the Event of a release published since `scan.since`, with its version and its name when it has one of
 * its own; a draft is no Event.
 * @example
 * releaseEvent({ id: 77, tag_name: 'v2.5.0', name: 'PDF export', draft: false, published_at: t }, scan);
 * // { kind: 'release.published', archetype: 'publish', text: { en: { detail: 'v2.5.0: PDF export', tag: 'v2.5.0' } } }
 */
export function releaseEvent(release: Release, scan: Scan): SourceEvent | null {
  if (release.draft || release.published_at === null || release.published_at <= scan.since) return null;

  const name = release.name?.trim() ?? '';

  const version = release.tag_name;

  const detail = name === '' || name === version ? version : colonDetail(version, name);

  return githubEvent(scan.source, {
    id: `release-${release.id}`,
    kind: 'release.published',
    archetype: 'publish',
    rarity: 'notable',
    at: release.published_at,
    text: eventText({ fr: 'Nouvelle version publiée', en: 'New release published' }, detail, clip(version, TAG_LENGTH)),
  });
}
