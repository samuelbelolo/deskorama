import type { Language } from '@deskorama/core';

/** The words of the section under the demo that explains how the pieces fit together. */
export interface ExplainerText {
  readonly explainerTitle: string;
  readonly sourcesTitle: string;
  readonly sourcesBody: string;
  readonly rolesTitle: string;
  readonly rolesBody: string;
  readonly gaugesTitle: string;
  readonly gaugesBody: string;
  readonly themesTitle: string;
  readonly themesBody: string;
  readonly feedTitle: string;
  readonly feedBody: string;
  readonly feedLink: string;
  readonly download: string;
  readonly downloadHint: string;
}

/** The explanation in every display language, in the project's words: Source, Role, Gauge, Theme, Feed. */
export const EXPLAINER_TEXT: Readonly<Record<Language, ExplainerText>> = {
  fr: {
    explainerTitle: 'Comment ça marche',
    sourcesTitle: 'Sources',
    sourcesBody:
      'Une source est un système que vous branchez : un dépôt GitHub, un SaaS, votre propre backend. Un connecteur l’interroge depuis votre Mac avec votre jeton. Rien sur Internet ne se connecte à votre Mac.',
    rolesTitle: 'Rôles',
    rolesBody:
      'La source donne à chaque événement un rôle : arrivée, approbation, argent, erreur, mise en ligne… Le thème ne connaît que les rôles, jamais les événements de la source : c’est pour cela que les quatre sources de la démo jouent sur la même scène.',
    gaugesTitle: 'Compteurs',
    gaugesBody:
      'Trois compteurs restent à l’écran : la foule du moment, un compte depuis minuit et un total qui bouge lentement, plus l’état de la mise en production. Chaque source les nomme à sa façon : commits du jour, inscriptions, étoiles.',
    themesTitle: 'Thèmes',
    themesBody:
      'Un thème dessine la scène et joue un gag par rôle, avec une légende qui dit le fait puis un détail. Il ne joue que là où le fond d’écran se voit, et s’arrête quand une fenêtre le cache tout entier.',
    feedTitle: 'Brancher votre produit : le flux',
    feedBody:
      'Exposez dans votre backend une adresse HTTPS qui renvoie vos événements en JSON après un curseur, chacun avec son rôle et ses mots en français, en anglais ou les deux. L’appli l’interroge depuis votre Mac avec un jeton que vous choisissez ; vous n’hébergez rien de nouveau.',
    feedLink: 'Le format complet, son schéma JSON et des exemples',
    download: 'Télécharger Deskorama pour macOS',
    downloadHint: 'La dernière version, pour les Mac Apple silicon.',
  },
  en: {
    explainerTitle: 'How it fits together',
    sourcesTitle: 'Sources',
    sourcesBody:
      'A Source is a system you plug in: a GitHub repository, a SaaS, your own backend. A Connector polls it from your Mac with your own token. Nothing on the internet ever connects to your Mac.',
    rolesTitle: 'Roles',
    rolesBody:
      'The Source gives each event a Role: arrival, approval, money, error, deploy… The Theme only knows Roles, never the Source’s own events: that is why the demo’s four Sources all play on the same scene.',
    gaugesTitle: 'Gauges',
    gaugesBody:
      'Three Gauges stay on screen: the crowd right now, a count since midnight and a slow running total, plus where production stands. Each Source names them its own way: commits today, sign-ups, stars.',
    themesTitle: 'Themes',
    themesBody:
      'A Theme draws the scene and plays one gag per Role, with a caption that says the fact, then one detail. It only plays where the wallpaper shows, and stops when a window hides all of it.',
    feedTitle: 'Plug in your product: the Feed',
    feedBody:
      'Expose an HTTPS address in your backend that returns your events as JSON after a cursor, each with its Role and its words in French, English or both. The app polls it from your Mac with a token you choose; you host nothing new.',
    feedLink: 'The full format, its JSON Schema and examples',
    download: 'Download Deskorama for macOS',
    downloadHint: 'The latest release, for Apple silicon Macs.',
  },
};
