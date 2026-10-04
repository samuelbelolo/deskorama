import type { DeployStep, Language, WallpaperEvent } from '@deskorama/core';
import { wallpaperEventFixture } from '@deskorama/test-utils';

/** The words of each deploy step, in both languages. */
const WORDS: Readonly<Record<DeployStep, { fr: string; en: string }>> = {
  started: { fr: 'Mise en ligne lancée', en: 'Deploy started' },
  succeeded: { fr: 'Mise en ligne réussie', en: 'Deploy succeeded' },
  failed: { fr: 'Mise en ligne ratée', en: 'Deploy failed' },
};

/**
 * Returns a deploy step of Tramlo's web apps, tagged with its version, as a Theme receives it.
 * @example
 * deployEvent('fr', 'failed').label; // "Mise en ligne ratée"
 */
export function deployEvent(lang: Language, step: DeployStep, tag = 'v2.5.0'): WallpaperEvent {
  return wallpaperEventFixture(lang, {
    id: `deploy-${step}-${tag}`,
    kind: `deploy.${step}`,
    archetype: 'deploy',
    rarity: step === 'failed' ? 'jackpot' : 'notable',
    step,
    text: {
      fr: { label: WORDS[step].fr, detail: 'web, docs, admin', tag },
      en: { label: WORDS[step].en, detail: 'web, docs, admin', tag },
    },
  });
}
