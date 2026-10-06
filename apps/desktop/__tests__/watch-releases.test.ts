import { createFakeClock } from '@deskorama/test-utils';
import { describe, expect, test } from 'vitest';
import type { Fetch, LatestRelease } from '../src/main/fetch-latest-release.ts';
import { watchReleases } from '../src/main/watch-releases.ts';

const REPOSITORY = 'samuelbelolo/deskorama';
const HOUR = 60 * 60 * 1000;

/**
 * Returns a fake GitHub whose latest release a test changes, and the addresses it was asked for.
 * @example
 * const github = fakeGitHub({ tag_name: 'v0.3.0', html_url: '…' });
 */
function fakeGitHub(latest: Record<string, unknown> | null): {
  fetch: Fetch;
  asked: string[];
  set: (next: Record<string, unknown> | null) => void;
  /** Makes GitHub fail from now on (a rate limit), or answer again. */
  fail: (failing: boolean) => void;
  /** Makes GitHub never answer from now on, like a stalled connection. */
  stall: () => void;
} {
  let current = latest;
  let failing = false;
  let stalled = false;
  const asked: string[] = [];
  return {
    asked,
    set: (next) => void (current = next),
    fail: (next) => void (failing = next),
    stall: () => void (stalled = true),
    fetch: async (url) => {
      asked.push(url);
      if (stalled) return new Promise<Response>(() => {});
      if (failing) return new Response('{"message":"API rate limit exceeded"}', { status: 403 });
      return current === null ? new Response('{"message":"Not Found"}', { status: 404 }) : Response.json(current);
    },
  };
}

/**
 * Lets the fake GitHub's answer arrive: its promises settle before Node's next turn.
 * @example
 * await settle();
 */
function settle(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * Returns the release page of a version of the repository.
 * @example
 * page('v0.3.0'); // "https://github.com/samuelbelolo/deskorama/releases/tag/v0.3.0"
 */
function page(tag: string): string {
  return `https://github.com/${REPOSITORY}/releases/tag/${tag}`;
}

describe('the release watch', () => {
  test('reports a release newer than the running app, once, at launch', async () => {
    const clock = createFakeClock();
    const github = fakeGitHub({ tag_name: 'v0.3.0', html_url: page('v0.3.0') });
    const found: LatestRelease[] = [];
    watchReleases({
      repository: REPOSITORY,
      version: '0.2.0',
      clock,
      fetch: github.fetch,
      onNewRelease: (release) => found.push(release),
    });
    clock.advance(0);
    await settle();
    expect(github.asked).toEqual([`https://api.github.com/repos/${REPOSITORY}/releases/latest`]);
    expect(found).toEqual([{ tag: 'v0.3.0', url: page('v0.3.0') }]);
    clock.advance(HOUR);
    await settle();
    expect(found).toHaveLength(1);
  });

  test('asks again every hour, and reports the next release when it comes', async () => {
    const clock = createFakeClock();
    const github = fakeGitHub(null);
    const found: string[] = [];
    watchReleases({
      repository: REPOSITORY,
      version: '0.2.0',
      clock,
      fetch: github.fetch,
      onNewRelease: (release) => found.push(release.tag),
    });
    clock.advance(0);
    await settle();
    github.set({ tag_name: 'v0.2.1', html_url: page('v0.2.1') });
    clock.advance(HOUR);
    await settle();
    expect(github.asked).toHaveLength(2);
    expect(found).toEqual(['v0.2.1']);
  });

  test('never reports the running version, nor a page outside the repository', async () => {
    const clock = createFakeClock();
    const found: string[] = [];
    const same = fakeGitHub({ tag_name: 'v0.2.0', html_url: page('v0.2.0') });
    watchReleases({
      repository: REPOSITORY,
      version: '0.2.0',
      clock,
      fetch: same.fetch,
      onNewRelease: (release) => found.push(release.tag),
    });
    const foreign = fakeGitHub({ tag_name: 'v9.0.0', html_url: 'https://tramlo.example/download' });
    watchReleases({
      repository: REPOSITORY,
      version: '0.2.0',
      clock,
      fetch: foreign.fetch,
      onNewRelease: (release) => found.push(release.tag),
    });
    clock.advance(0);
    await settle();
    expect(found).toEqual([]);
  });

  test('asks when told to, says what it learnt, and reuses an answer under a minute old', async () => {
    const clock = createFakeClock();
    const github = fakeGitHub(null);
    const found: string[] = [];
    const releases = watchReleases({
      repository: REPOSITORY,
      version: '0.2.0',
      clock,
      fetch: github.fetch,
      onNewRelease: (release) => found.push(release.tag),
    });
    clock.advance(0);
    await settle();

    github.set({ tag_name: 'v0.2.1', html_url: page('v0.2.1') });

    // GitHub would still serve the launch's answer: no request is spent on it.
    expect(await releases.check()).toBe('none');
    expect(github.asked).toHaveLength(1);

    clock.advance(60 * 1000);

    expect(await releases.check()).toBe('newer');
    expect(await releases.check()).toBe('newer');
    expect(found).toEqual(['v0.2.1']);
    expect(github.asked).toHaveLength(2);
  });

  test('says when GitHub did not answer, and asks again at once rather than reuse that', async () => {
    const clock = createFakeClock();
    const github = fakeGitHub({ tag_name: 'v0.2.1', html_url: page('v0.2.1') });
    github.fail(true);
    const releases = watchReleases({
      repository: REPOSITORY,
      version: '0.2.0',
      clock,
      fetch: github.fetch,
      onNewRelease: () => {},
    });
    clock.advance(0);
    await settle();

    expect(await releases.check()).toBe('unreachable');

    github.fail(false);

    expect(await releases.check()).toBe('newer');
    expect(github.asked).toHaveLength(3);
  });

  test('joins a check already on its way instead of answering before it', async () => {
    const clock = createFakeClock();
    const github = fakeGitHub({ tag_name: 'v0.2.1', html_url: page('v0.2.1') });
    const releases = watchReleases({
      repository: REPOSITORY,
      version: '0.2.0',
      clock,
      fetch: github.fetch,
      onNewRelease: () => {},
    });
    clock.advance(0);

    // The launch's request has left and not come back yet.
    expect(await releases.check()).toBe('newer');
    expect(github.asked).toHaveLength(1);
  });

  test('gives up on a connection that stalls, after ten seconds', async () => {
    const clock = createFakeClock();
    const github = fakeGitHub(null);
    github.stall();
    const releases = watchReleases({
      repository: REPOSITORY,
      version: '0.2.0',
      clock,
      fetch: github.fetch,
      onNewRelease: () => {},
    });
    const asked = releases.check();
    clock.advance(10 * 1000);

    expect(await asked).toBe('unreachable');
  });

  test('asks no more once stopped, even when a check was on its way', async () => {
    const clock = createFakeClock();
    const github = fakeGitHub({ tag_name: 'v0.2.1', html_url: page('v0.2.1') });
    const found: string[] = [];
    const releases = watchReleases({
      repository: REPOSITORY,
      version: '0.2.0',
      clock,
      fetch: github.fetch,
      onNewRelease: (release) => found.push(release.tag),
    });
    clock.advance(0);
    releases.stop();
    await settle();
    clock.advance(2 * HOUR);
    await settle();

    expect(found).toEqual([]);
    expect(github.asked).toHaveLength(1);
  });

  test('stays off in a local build, which knows no repository', async () => {
    const clock = createFakeClock();
    const github = fakeGitHub(null);
    const releases = watchReleases({
      repository: '',
      version: '0.0.0',
      clock,
      fetch: github.fetch,
      onNewRelease: () => {},
    });
    clock.advance(HOUR);

    expect(releases.on).toBe(false);
    expect(await releases.check()).toBe('none');
    expect(github.asked).toEqual([]);
  });
});
