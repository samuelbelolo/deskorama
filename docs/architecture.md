# Architecture

How Deskorama is put together, for someone about to change it. The words (Source, Connector, Event, Role, Gauge, Theme, Gag, Caption) are the ones the README introduces.

```
Source ──▶ Connector ──▶ engine (core) ──▶ Theme, one per screen
           SourceEvent   WallpaperEvent     draws into a layer,
           + profile     + ScreenHost       through its ScreenHost
                             ▲
                           Host (the platform: the macOS app or the demo)
```

## Layers and the dependency rule

| Layer      | Where                       | What it knows                                                                                              |
| ---------- | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| core       | `packages/core`             | The contracts below, the Clock, the seeded random generator and the engine. No runtime dependency          |
| Connectors | `packages/connectors/*`     | One kind of Source each, mapped onto Roles. Core and the Event JSON only                                   |
| Event JSON | `packages/event-json`       | The JSON form of an Event that a Feed returns and the Local webhook accepts, and its validation            |
| Themes     | `packages/themes/*`         | One scene each, reacting to Roles. Core only                                                               |
| test-utils | `packages/test-utils`       | A fake Host, a fake Clock, a fake `fetch`, Event fixtures and the Connector contract suite, for tests only |
| apps       | `apps/desktop`, `apps/demo` | The platforms: they wire a Connector, the engine and a Theme together                                      |

Dependencies point inward, to core:

- core imports no npm package and no other workspace package (type-only imports aside);
- a Connector never imports a Theme, a Theme never imports a Connector, and neither imports another of its kind; what two of them share belongs in core, or in the Event JSON package when it needs a validation library;
- no package imports an app, and no app imports another app;
- shipped code never imports `test-utils`.

`pnpm deps` checks these rules with dependency-cruiser (`.dependency-cruiser.cjs`), and CI fails when one breaks. Internal packages are consumed as TypeScript source: nothing is built except the demo and the desktop app.

## Contracts

All of them live in `packages/core/src` and are exported from its `index.ts`.

**Event.** A Connector produces a `SourceEvent`: an id stable per Source (replays are dropped), the Source's own `kind`, its Role in `archetype` (null for a kind no one described), a rarity, the time, and its words (`label`, `detail`, `tag`) in every display language. The engine turns it into a `WallpaperEvent`, the same Event with its words in the screen's language only. A Theme dispatches on `archetype` and never on `kind`.

**Connector.** A `Connector` reads one kind of Source by polling it: it declares what a person fills in to connect a Source (its fields, the token permissions to request, the bounds of its polling interval) and the words of the Source's three Gauges in every language, and its `poll` takes the previous cursor, the Source's settings with its token, an injected `fetch` and the current time. It returns the new `SourceEvent`s, each with its Role already set, any Gauge values, the next cursor and a suggested delay. A Connector never reaches the network, the clock or a file itself, and keeps no state between polls: everything it needs to resume travels in its opaque cursor. It validates every external payload through Standard Schema (`parsePayload`), and the only error it throws is a `ConnectorError` that classifies the failure: a refused token, a missing permission (named), a rate limit with its reset, a network failure, or an answer it cannot read. A shared suite in `test-utils` (`describeConnectorContract`) checks every Connector against recorded responses served by a fake `fetch`. The Feed (`packages/connectors/feed`) is the first; its format is in [feed.md](feed.md).

The Local webhook (`packages/connectors/local-webhook`) is the exception: scripts push to it, so it listens rather than polls, and hands each Event it accepts straight to the platform.

**Theme.** A `Theme<Layer>` has a `name` and a `mount(layer, host)` that draws the scene into `layer` (an `HTMLElement` in a browser, anything in a test) and returns what removes it. It gets everything else from its `ScreenHost`: the language, its screen, a Clock, a seeded `Random`, the reduced-motion setting, the Source's name and Gauge words, the Events routed to its screen, the Gauges, today's tally, the recent Events and the visible regions of its screen. Every string a Theme draws exists in French and English.

**Host.** The platform implements `Host`: the connected screens, a Clock, the reduced-motion setting and the frames of everything covering the wallpaper (windows, the menu bar, the Dock). From those frames the engine computes each screen's visible regions on a grid of 60 px tiles, so a Gag plays where the wallpaper can be seen and a fully covered screen stops drawing.

**Clock and Random.** Nothing reads the system time, schedules a timer or draws a random number directly: time comes from the `Clock`, randomness from the seeded `Random`. A Gag is a function of the Event, the time and the seed, so a test steps a fake Clock and checks every frame. Only the platforms' own Clocks touch the real time.

## Why Connectors pull

Deskorama runs on a laptop behind a home or office router, with no server of its own. A service on the internet cannot reach it, and a relay would be a server for every user to host. So a Connector that reads an internet service polls it from the Mac, with the user's own token, and keeps a cursor: after the Mac sleeps it catches up from the cursor, where a push would have been lost. The price is a delay of up to one polling interval between an event and its Gag, which a wallpaper that is mostly hidden can afford.

The only push is local. The Local webhook accepts Events from scripts on the same Mac, on the loopback interface only. The Feed polls the user's own backend for Events in the same JSON format; Connectors for well-known services come later and follow the same rule.

## The macOS app

`apps/desktop` is an Electron app that lives in the menu bar, with no Dock icon.

- **Main process** (`src/main`). It opens one wallpaper window per display, starts the Local webhook, polls the connected Sources, reads the other windows' frames, draws the menu-bar icon and watches the repository's releases. It alone touches Node, the network and the system's seeds and secrets.
- **Sources** (`src/main/sources`). Each Source the person connected is polled by its Connector from the cursor saved in `cursors.json`, so Events missed while the Mac slept or the app was closed arrive on the next poll; waking the Mac polls every Source at once. Event ids are remembered, so a replayed page never plays twice. A failure never stops the app: a refused token or a missing permission stops that Source until the person edits it, a rate limit waits for its reset, and anything else is retried further apart each time. The menu bar names each failing Source and what to fix. Polling starts once every wallpaper page has loaded, so no first Event is sent to a page that does not listen yet. The Gauge values a Source reports are not shown yet: the scene's Gauges keep the words of the Source that names it, and choosing which Source feeds them comes with the rest of the settings.
- **Secrets.** Every token, and the Local webhook's secret, is a generic password in the login Keychain (service "Deskorama"), read through `@napi-rs/keyring`, a prebuilt native module and the app's one shipped dependency. `settings.json` holds the rest of each Source (its Connector, name and address), never a token.
- **Settings window** (`src/renderer/settings`). Opened from the menu bar, it adds, tests, edits and removes Sources. A test polls once from no cursor and shows the latest Events without saving anything. Removing a Source deletes its token and its cursor. Its preload exposes `window.settings`, and the main process answers only that window's own page.
- **Window frames** (`src/main/window-frames`). get-windows' macOS executable lists other apps' windows without the Screen Recording permission: frames, no titles. The main process reads them every second while some wallpaper shows and every three seconds while all of it is covered, adds the menu bar and the Dock, and sends the frames to every wallpaper window whenever they change. A window exactly the size of a display is left out: macOS keeps such an invisible window above every app (Notification Center's), while a real app window never covers the menu bar. `DESKORAMA_WINDOW_FRAMES=off` ignores other apps' windows and `DESKORAMA_USER_DATA` gives a run its own settings, cursors and single-instance lock; the end-to-end test sets both.
- **Window level.** Each wallpaper window is a frameless `BrowserWindow` of `type: 'desktop'`: macOS places it above the system wallpaper and under the desktop icons. It shows on every Space but not over full-screen apps, and ignores the mouse so the icons stay clickable.
- **Renderer** (`src/renderer`). Each window runs the engine and the Theme for its screen, with context isolation, a sandbox and no Node. It may not navigate or open windows. Its Host reports the frames the main process sends, so Gags play only where the wallpaper can be seen.
- **Bridge** (`src/preload`, `src/shared`). The preload exposes `window.wallpaper`, the renderer's only way to the main process. The main process sends each window its Events, the window frames and the Gauge values, as plain data that the renderer turns back into `SourceEvent`s. The main process and the renderer share types and pure functions through `src/shared` only.

The demo (`apps/demo`) is the other platform: the same engine and Theme in a browser page, on a fake desktop with draggable windows and a fictional Source.
