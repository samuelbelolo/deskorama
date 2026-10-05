import type { Language } from '@deskorama/core';
import type { SettingsSnapshot, SourceView } from '../../src/shared/settings-snapshot.ts';
import { emptySnapshot } from './empty-snapshot.ts';
import { NOW } from './now.ts';

/** What every fictional Source of this snapshot shares: read a minute ago, no Event yet. */
const READ = { interval: null, status: { state: 'ok', at: NOW - 60_000 }, last: null } as const;

/** A Vercel Source saved when it followed one project, typed by its name. */
export const OLD_VERCEL: SourceView = {
  ...READ,
  id: 'src-vercel-old',
  connector: 'vercel',
  name: 'Tramlo',
  values: { project: 'tramlo-web' },
};

/** A PostHog Source saved with a typed address and one sign-up event. */
export const OLD_POSTHOG: SourceView = {
  ...READ,
  id: 'src-posthog-old',
  connector: 'posthog',
  name: 'Kavelo',
  values: { host: 'https://eu.posthog.com', project: '12345', signupEvent: 'user_signed_up' },
};

/**
 * Returns what the window shows with Sources that follow several projects or events, and two saved before a
 * Source could: three Vercel projects, a Sentry organization narrowed to two projects and one environment, and the
 * old Vercel and PostHog Sources.
 * @example
 * pickedSnapshot('fr').sources.length; // 4
 */
export function pickedSnapshot(lang: Language): SettingsSnapshot {
  const sources: SourceView[] = [
    {
      ...READ,
      id: 'src-vercel',
      connector: 'vercel',
      name: 'Tramlo',
      values: {},
      lists: { projects: ['prj_web', 'prj_api', 'prj_docs'] },
    },
    {
      ...READ,
      id: 'src-sentry',
      connector: 'sentry',
      name: 'Tramlo errors',
      values: { organization: 'tramlo' },
      lists: { projects: ['tramlo-web', 'tramlo-api'], environments: ['production'] },
    },
    OLD_VERCEL,
    OLD_POSTHOG,
  ];

  return { ...emptySnapshot(lang), sources };
}
