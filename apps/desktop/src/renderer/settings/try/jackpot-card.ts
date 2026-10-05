import type { Language, ThemeAbout } from '@deskorama/core';
import { element } from '../element.ts';
import { icon } from '../icon.ts';
import { ROLE_NAMES } from '../role-names.ts';
import { SETTINGS_TEXT } from '../text/text-by-language.ts';

/**
 * Returns the card of the failed deploy, the Theme's one big scene: its real picture, what plays in the Theme's
 * own words, when it plays for real, and its play button.
 * @example
 * jackpotCard(AEROPORT_ABOUT, 'fr', play('failed-deploy')); // the picture of the closed runway, "Vol annulé…", [▶]
 */
export function jackpotCard(about: ThemeAbout, lang: Language, playButton: HTMLElement): HTMLElement {
  const text = SETTINGS_TEXT[lang];

  return element('div', { className: 'jackpot' }, [
    element('img', { attributes: { src: about.pictures.jackpot, alt: '' } }),
    element('div', { className: 'jackpot-text' }, [
      element('h3', {}, [icon('fire'), element('span', { text: ROLE_NAMES['failed-deploy'][lang] })]),
      element('p', { text: about.gags['failed-deploy'][lang] }),
      element('p', { className: 'muted small', text: text.jackpotLead }),
    ]),
    playButton,
  ]);
}
