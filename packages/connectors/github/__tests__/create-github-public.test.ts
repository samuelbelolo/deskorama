import { describe, expect, test } from 'vitest';
import { createGithubPublic } from '../src/create-github-public.ts';
import { createGithub } from '../src/create-github.ts';
import { answerFrom } from './answer-from.ts';
import { MINUTE, pollOnce } from './poll-once.ts';
import { recording } from './recording.ts';
import { pollOfKit, TRAMLO_KIT, TRAMLO_KIT_REPOSITORY } from './tramlo-kit.ts';

describe('the GitHub Connector of a public repository', () => {
  test('welcomes a first-time contributor and counts stars, from the repository’s GitHub address', async () => {
    const { result } = await pollOnce(createGithubPublic(), TRAMLO_KIT, answerFrom(TRAMLO_KIT_REPOSITORY, pollOfKit()));

    expect(result.events.map((event) => [event.kind, event.archetype, event.text.fr, event.text.en])).toEqual([
      [
        'contributor.first',
        'partner',
        { label: 'Premier contributeur extérieur', detail: 'Première PR : Fix a typo in the README', tag: 'BIENVENUE' },
        { label: 'First-time contributor', detail: 'First PR: Fix a typo in the README', tag: 'WELCOME' },
      ],
    ]);
    expect(result.gauges).toEqual({ crowd: 1, total: 2416 });
  });

  test('turns stars and forks added since the previous poll into Events', async () => {
    const first = await pollOnce(createGithubPublic(), TRAMLO_KIT, answerFrom(TRAMLO_KIT_REPOSITORY, pollOfKit()));

    const second = await pollOnce(
      createGithubPublic(),
      TRAMLO_KIT,
      answerFrom(TRAMLO_KIT_REPOSITORY, pollOfKit('repository-later.json')),
      first.result.cursor,
      MINUTE,
    );

    expect(second.result.events.map((event) => [event.kind, event.archetype, event.text.fr, event.text.en])).toEqual([
      [
        'star.added',
        'like',
        { label: '2 nouvelles étoiles', detail: '2 418 étoiles au total', tag: '+2' },
        { label: '2 new stars', detail: '2,418 stars in total', tag: '+2' },
      ],
      [
        'repository.forked',
        'usage',
        { label: 'Dépôt forké', detail: '319 forks au total', tag: 'FORK' },
        { label: 'Repository forked', detail: '319 forks in total', tag: 'FORK' },
      ],
    ]);
    expect(second.result.gauges?.total).toBe(2418);
  });

  test('turns stars removed into a departure', async () => {
    const later = await pollOnce(
      createGithubPublic(),
      TRAMLO_KIT,
      answerFrom(TRAMLO_KIT_REPOSITORY, pollOfKit('repository-later.json')),
    );

    const earlier = await pollOnce(
      createGithubPublic(),
      TRAMLO_KIT,
      answerFrom(TRAMLO_KIT_REPOSITORY, pollOfKit()),
      later.result.cursor,
      MINUTE,
    );

    const removed = earlier.result.events.find((event) => event.kind === 'star.removed');

    expect(removed?.archetype).toBe('departure');
    expect(removed?.text.en).toEqual({ label: '2 stars removed', detail: '2,416 stars in total', tag: '-2' });
  });

  test('read by the private Connector, the same repository never assumes stars or first-time contributors', async () => {
    const routes = {
      ...pollOfKit(),
      '/pulls?state=open&per_page=1': recording('tramlo-kit', 'pulls.json'),
    };

    const { result } = await pollOnce(createGithub(), TRAMLO_KIT, answerFrom(TRAMLO_KIT_REPOSITORY, routes));

    expect(result.events.map((event) => [event.kind, event.archetype])).toEqual([['pull_request.opened', 'arrival']]);
    expect(result.gauges).toEqual({ crowd: 1, total: 51 });
  });
});
