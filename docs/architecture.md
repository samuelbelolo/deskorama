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

**Connector.** A `Connector` reads one kind of Source by polling it: it declares how it presents itself (`about`: its logo, one line of what it brings, the page where its token is created and what to choose there), what a person fills in to connect a Source (its fields, the token permissions to request, the bounds of its polling interval) and the words of the Source's three Gauges in every language, and its `poll` takes the previous cursor, the Source's settings with its token, an injected `fetch` and the current time. It returns the new `SourceEvent`s, each with its Role already set, any Gauge values, the next cursor and a suggested delay. A Connector never reaches the network, the clock or a file itself, and keeps no state between polls: everything it needs to resume travels in its opaque cursor. It validates every external payload through Standard Schema (`parsePayload`), and the only error it throws is a `ConnectorError` that classifies the failure: a refused token, a missing permission (named), a rate limit with its reset, a network failure, or an answer it cannot read. A shared suite in `test-utils` (`describeConnectorContract`) checks every Connector against recorded responses served by a fake `fetch`. The Feed (`packages/connectors/feed`) is the first; its format is in [feed.md](feed.md).

The Local webhook (`packages/connectors/local-webhook`) is the exception: scripts push to it, so it listens rather than polls, and hands each Event it accepts straight to the platform. It presents itself too, through its `./about` entry.

**Theme.** A `Theme<Layer>` has a `name` and a `mount(layer, host)` that draws the scene into `layer` (an `HTMLElement` in a browser, anything in a test) and returns what removes it. It gets everything else from its `ScreenHost`: the language, its screen, a Clock, a seeded `Random`, the reduced-motion setting, the Source's name and Gauge words, the Events routed to its screen, the Gauges, today's tally, the recent Events and the visible regions of its screen. Every string a Theme draws exists in French and English. Next to its scene, a Theme package describes itself through its `./about` entry, a `ThemeAbout`: its name, one line of what it is, one sentence per Role saying what it plays (and one for the failed deploy), and real pictures of it by day, by night and during a failed deploy.

**Host.** The platform implements `Host`: the connected screens, a Clock, the reduced-motion setting and the frames of everything covering the wallpaper (windows, the menu bar, the Dock). From those frames the engine computes each screen's visible regions on a grid of 60 px tiles, so a Gag plays where the wallpaper can be seen and a fully covered screen stops drawing.

**Clock and Random.** Nothing reads the system time, schedules a timer or draws a random number directly: time comes from the `Clock`, randomness from the seeded `Random`. A Gag is a function of the Event, the time and the seed, so a test steps a fake Clock and checks every frame. Only the platforms' own Clocks touch the real time.

## Why Connectors pull

Deskorama runs on a laptop behind a home or office router, with no server of its own. A service on the internet cannot reach it, and a relay would be a server for every user to host. So a Connector that reads an internet service polls it from the Mac, with the user's own token, and keeps a cursor: after the Mac sleeps it catches up from the cursor, where a push would have been lost. The price is a delay of up to one polling interval between an event and its Gag, which a wallpaper that is mostly hidden can afford.

The only push is local. The Local webhook accepts Events from scripts on the same Mac, on the loopback interface only. The Feed polls the user's own backend for Events in the same JSON format; Connectors for well-known services come later and follow the same rule.

## The macOS app

`apps/desktop` is an Electron app that lives in the menu bar, with no Dock icon.

- **Main process** (`src/main`). It opens one wallpaper window per display, starts the Local webhook, polls the connected Sources, reads the other windows' frames, draws the menu-bar icon and watches the repository's releases. It alone touches Node, the network and the system's seeds and secrets.
- **Sources** (`src/main/sources`). Each Source the person connected is polled by its Connector from the cursor saved in `cursors.json`, so Events missed while the Mac slept or the app was closed arrive on the next poll; waking the Mac polls every Source at once. Event ids are remembered, so a replayed page never plays twice. A failure never stops the app: a refused token or a missing permission stops that Source until the person edits it, a rate limit waits for its reset, and anything else is retried further apart each time. The menu bar names each failing Source and what to fix. Polling starts once every wallpaper page has loaded, so no first Event is sent to a page that does not listen yet. Each Source is polled at the interval the person chose within its Connector's bounds, or at the Connector's default.
- **Secrets.** Every token, and the Local webhook's secret, is a generic password in the login Keychain (service "Deskorama"), read through `@napi-rs/keyring`, a prebuilt native module and the app's one shipped dependency. `settings.json` holds the rest of each Source (its Connector, name and address), never a token. The Local webhook can be turned off from the settings window, which `settings.json` remembers, and its secret drawn again, which turns away the scripts that hold the old one.
- **Scene** (`src/main/scene`). The Theme, the display language (the Mac's own unless the person picks one) and the Source that names the scene are kept in `settings.json`. When several Sources are connected, the person picks the brand Source and the Source that feeds each Gauge; by default the first Source does both. Each Gauge shows the values its own Source reports, under that Source's words, and moves only with that Source's Events; the build state comes from whichever Source reports it. Every change is sent to the wallpaper windows, which mount the new Theme on the same engine, or start a new engine for a new language or new Source words.
- **Menu bar.** Besides each failing Source and the Local webhook, it pauses the wallpaper in one click (for a screen share) and switches the Theme. A paused page reports its whole screen as covered and holds the Events and Gauge values it receives, so nothing on screen changes; when the pause ends, what was held plays, or comes as the recap after a pause longer than two minutes. A pause is not kept across launches.
- **Settings window** (`src/renderer/settings`). Opened from the menu bar, it is drawn after a macOS settings window: a hidden title bar, a sidebar on the system's own material (a solid fill when transparency is reduced), the Mac's accent colour, light and dark. Its four panes are the Wallpaper (the Theme with its real pictures, the language, opening at login through macOS's Service Management, and, with several Sources, the brand Source and the Source of each Gauge), the Sources (the connected ones with where each stands and its last Event, then a catalogue of every Connector), Try it (a test Event per Role and a failed deploy, each with the line the Theme provides; once a test deploy's scene is over, production shows its real state again) and the Local webhook (on or off, its address, its secret, an example command, the latest Events received). Connecting or editing a Source is a sheet in four steps: create the token on the page the Connector names, tick its permissions, paste it, test it. A test polls once from no cursor and shows the latest Events with their Roles, or the Gauge values of a Source that reports only those, without saving anything; Save stays off until a test has passed for what the fields hold. Removing a Source asks once more, then deletes its token and its cursor. The window never names a service or a Theme itself: everything it shows about one comes from the Connector or the Theme package, logos and glyphs are bundled, and the page loads nothing from the network. Its preload exposes `window.settings`, and the main process answers only that window's own page; the page has no clipboard access, so the main process copies for it, and the Local webhook's secret reaches the page only when the person asks to see it. `mountSettingsWindow(root, bridge)` is the whole window, so its tests drive it in a browser through a fake bridge.
- **Window frames** (`src/main/window-frames`). get-windows' macOS executable lists other apps' windows without the Screen Recording permission: frames, no titles. The main process reads them every second while some wallpaper shows and every three seconds while all of it is covered, adds the menu bar and the Dock, and sends the frames to every wallpaper window whenever they change. A window exactly the size of a display is left out: macOS keeps such an invisible window above every app (Notification Center's), while a real app window never covers the menu bar. `DESKORAMA_WINDOW_FRAMES=off` ignores other apps' windows and `DESKORAMA_USER_DATA` gives a run its own settings, cursors and single-instance lock; the end-to-end test sets both.
- **Window level.** Each wallpaper window is a frameless `BrowserWindow` of `type: 'desktop'`: macOS places it above the system wallpaper and under the desktop icons. It shows on every Space but not over full-screen apps, and ignores the mouse so the icons stay clickable.
- **Renderer** (`src/renderer`). Each window runs the engine and the Theme for its screen, with context isolation, a sandbox and no Node. It may not navigate or open windows. Its Host reports the frames the main process sends, so Gags play only where the wallpaper can be seen.
- **Bridge** (`src/preload`, `src/shared`). The preload exposes `window.wallpaper`, the renderer's only way to the main process. The main process sends each window its Events, the window frames, the Gauge values, the scene and the pause, as plain data that the renderer turns back into `SourceEvent`s. The main process and the renderer share types and pure functions through `src/shared` only.

The demo (`apps/demo`) is the other platform: the same engine and Theme in a browser page, on a fake desktop with draggable windows and a fictional Source.
