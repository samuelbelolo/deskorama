# Changelog

## [0.3.0](https://github.com/samuelbelolo/deskorama/compare/v0.2.1...v0.3.0) (2026-10-06)


### Features

* **desktop:** check for a new release from the menu bar ([11c9b2e](https://github.com/samuelbelolo/deskorama/commit/11c9b2e07097501ce310e134fb075a1597895de0))


### Bug Fixes

* **desktop:** no blank rectangle when the app opens or quits ([11c9b2e](https://github.com/samuelbelolo/deskorama/commit/11c9b2e07097501ce310e134fb075a1597895de0))

## [0.2.1](https://github.com/samuelbelolo/deskorama/compare/v0.2.0...v0.2.1) (2026-10-06)


### Bug Fixes

* **aeroport:** stand the scene above the Dock ([cbea1e0](https://github.com/samuelbelolo/deskorama/commit/cbea1e05197eaba057b241b830146871a4d17392))
* **desktop:** dissolve the scene into place when the Dock moves it ([d904e71](https://github.com/samuelbelolo/deskorama/commit/d904e713333d4fd4f31cbd82551edf62dcffea7e))
* **desktop:** keep the wallpaper window when the Dock moves ([29d66c4](https://github.com/samuelbelolo/deskorama/commit/29d66c4674d36df5fd4637564c91c041fd27b411))

## [0.2.0](https://github.com/samuelbelolo/deskorama/compare/v0.1.0...v0.2.0) (2026-10-05)


### Features

* **desktop:** give the app its own icon ([a797233](https://github.com/samuelbelolo/deskorama/commit/a797233ef6863966eea679db53a6b137d8c7aaeb))

## 0.1.0 (2026-10-05)


### Features

* **aeroport:** add rare events, the failed-deploy jackpot and the second screen ([dbea9ce](https://github.com/samuelbelolo/deskorama/commit/dbea9ce3ce7b39fca01585fd483a3ba561693a5b))
* **aeroport:** add the Aéroport theme ([910373e](https://github.com/samuelbelolo/deskorama/commit/910373e50336c6cfc3378d253d16207498b31265))
* **connectors:** add the Feed and Local webhook connectors ([6080748](https://github.com/samuelbelolo/deskorama/commit/6080748769c5f3a0fcaccd02753767c3555ca433))
* **connectors:** add the GitHub connector ([74e369b](https://github.com/samuelbelolo/deskorama/commit/74e369b866ca1d7526daef569b765dc626558976))
* **connectors:** add the Stripe and PostHog connectors ([f778f51](https://github.com/samuelbelolo/deskorama/commit/f778f5192866ec809ac6130b446e32cc7408bf99))
* **connectors:** add the Vercel, Sentry and Linear connectors ([73f245a](https://github.com/samuelbelolo/deskorama/commit/73f245ae244b45ded2fa0ca1c23d629fda276059))
* **core:** add the event model, the host and theme contracts, and the engine ([580569a](https://github.com/samuelbelolo/deskorama/commit/580569a3be4552787cd69683acf7f1acd508cc20))
* **demo:** add the browser demo and its GitHub Pages deployment ([6384add](https://github.com/samuelbelolo/deskorama/commit/6384add6e45a117c8f7b8df3568131abb37ee134))
* **demo:** add the source picker, the control panel and the explanation ([d725e28](https://github.com/samuelbelolo/deskorama/commit/d725e28e0ca00f70fdac4ce251088feb8a0c1c9d))
* **desktop:** add the macOS desktop app ([3062620](https://github.com/samuelbelolo/deskorama/commit/3062620c6358e73d08fe8e7bb70a4c8804d29bfb))
* **desktop:** add theme, language, pause, test events, login and gauge source settings ([a48bef8](https://github.com/samuelbelolo/deskorama/commit/a48bef8a07038332cd09a7d9213523d0d63231da))
* **desktop:** pick projects, events and environments from lists when connecting a Source ([ad0cc73](https://github.com/samuelbelolo/deskorama/commit/ad0cc7308e3f291fd0e256f46ae4b981e3e7e259))
* **desktop:** rebuild the settings window as a native macOS window ([5eae468](https://github.com/samuelbelolo/deskorama/commit/5eae4680eace87ee777b546d682ce52c9e5d03ec))
* **desktop:** route Events between screens from the main process and follow the displays ([fae6b1c](https://github.com/samuelbelolo/deskorama/commit/fae6b1c707d84b4ae21c0fefa0e3ba436c4f9066))
* **immeuble:** add rare events, the jackpot and the second screen, and offer the theme in the demo and the app ([e1f01aa](https://github.com/samuelbelolo/deskorama/commit/e1f01aaa2644bdd834e949e3aedc8b3bea20edc4))
* **immeuble:** add the Immeuble theme with its scene and everyday gags ([bbde496](https://github.com/samuelbelolo/deskorama/commit/bbde4964a245e8804cf5cc66e2cefd43448ae950))


### Bug Fixes

* **aeroport:** draw the Caravelle's main gear under the near wing ([969b144](https://github.com/samuelbelolo/deskorama/commit/969b14434e65b6366da23ee05884a942eff66d63))
* **connectors:** apply review fixes to the Feed, GitHub, Stripe and Local webhook connectors ([0257f16](https://github.com/samuelbelolo/deskorama/commit/0257f1653c32bffda59a705b3e8489ff375e0fe4))
* **desktop:** follow the engine's deploy rule and start a handed-over Gauge from zero ([bf7219a](https://github.com/samuelbelolo/deskorama/commit/bf7219ab27e56be18a8c17821b089f6724124deb))
* **desktop:** keep starting when the Local webhook refuses its secret ([8a6d623](https://github.com/samuelbelolo/deskorama/commit/8a6d623f60276cd949e4d45dcb15ee80f0146e06))
* **desktop:** offer every connector in the settings window ([7f071ba](https://github.com/samuelbelolo/deskorama/commit/7f071ba388e73d7be76b1b456e2b6025687889fb))
* **desktop:** save nothing when the Keychain refuses a Source's token ([00fc734](https://github.com/samuelbelolo/deskorama/commit/00fc7348610177d9aa4b3cc3b6e5b98428bf3460))
* **desktop:** tell apart Events that two Sources give the same id ([b8ea388](https://github.com/samuelbelolo/deskorama/commit/b8ea388a3af8b9c06a8d46e1905ae09e69189637))
* **event-json:** refuse a calendar day its month does not have ([5ad0faa](https://github.com/samuelbelolo/deskorama/commit/5ad0faa538c1c9fac9634f553b6041fc654bb989))
