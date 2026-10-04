# The Feed format

A Feed plugs your own product into Deskorama: you expose one HTTPS address that returns your Events as JSON, and the app polls it from the Mac with a token you choose. Nothing on the internet ever connects to the Mac, so you host nothing new: the address lives in your existing backend.

In the app, open **Settings…** from the menu bar, choose **Add: Feed**, and fill in a display name, the address and the token. **Test** shows the latest Events your address returns, before you save. The token is kept in the macOS Keychain.

## The request

Every minute by default, the app sends:

```http
GET https://api.tramlo.example/deskorama/events?cursor=c_1042
Authorization: Bearer <your token>
Accept: application/json
If-None-Match: "p7"
```

- `cursor` is the `next_cursor` of your previous answer, sent back untouched. The first request has none: return your most recent Events.
- `If-None-Match` comes only when your previous answer to that same cursor carried an `ETag`.
- The address must start with `https://`, so the token never travels in clear.

## The answer

```json
{
  "events": [
    {
      "id": "evt_1042",
      "kind": "invoice.paid",
      "archetype": "money",
      "rarity": "notable",
      "source": "Tramlo",
      "at": "2026-10-04T13:55:02+02:00",
      "text": {
        "fr": { "label": "Paiement reçu", "detail": "Abonnement annuel", "tag": "+49 €" },
        "en": { "label": "Payment received", "detail": "Yearly subscription", "tag": "+€49" }
      }
    }
  ],
  "next_cursor": "c_1042",
  "has_more": false,
  "poll_interval": 120,
  "gauges": { "crowd": 12, "daily": 37, "build": "ready" }
}
```

| Field           | Required | Meaning                                                                                                                                                                                                                                     |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `events`        | yes      | The Events after the cursor, oldest first, at most 100. Return more with `has_more`.                                                                                                                                                        |
| `next_cursor`   | yes      | Any string up to 1,000 characters that tells your backend where to resume. Opaque to the app: a timestamp works, an id works better. `null` only while you have no Event at all.                                                            |
| `has_more`      | yes      | `true` when more Events wait: the app asks again at once.                                                                                                                                                                                   |
| `poll_interval` | no       | Seconds to wait before the next request, kept between 30 seconds and 15 minutes.                                                                                                                                                            |
| `gauges`        | no       | Values of the scene's Gauges: `crowd` (right now), `daily` (since midnight), `total`, and the build state (`idle`, `building`, `ready`, `error`). Read and checked now; shown once the settings let you pick which Source feeds the Gauges. |

Other top-level fields are ignored, so your backend may add its own.

### One Event

| Field        | Required | Meaning                                                                                                                                                                                                                                               |
| ------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`         | yes      | Stable for this Event. An Event returned twice plays once.                                                                                                                                                                                            |
| `kind`       | yes      | Your own name for the kind of Event. Themes never read it.                                                                                                                                                                                            |
| `source`     | yes      | Up to 40 characters, shared with the Local webhook's format. The app shows the name you gave the Feed in Settings instead.                                                                                                                            |
| `text`       | yes      | The words in French (`fr`), English (`en`) or both; one language is used for both. `label` is the plain fact (required), `detail` one concrete line, `tag` about 12 characters painted on a prop (16 at most).                                        |
| `archetype`  | no       | The Role the scene plays: `arrival`, `partner`, `departure`, `approval`, `rejection`, `abandon`, `like`, `celebration`, `message`, `publish`, `usage`, `money`, `error`, `blocked` or `deploy`. Left out or `null`: the generic Gag, with your label. |
| `rarity`     | no       | `common` (the default), `notable`, `rare` or `jackpot`: rarer Events look bigger.                                                                                                                                                                     |
| `at`         | no       | ISO 8601 with `T`, then `Z` or an offset with a colon: `2026-10-04T13:55:02+02:00`. The time of the request when left out.                                                                                                                            |
| `step`       | no       | For deploys: `started`, `succeeded` or `failed`.                                                                                                                                                                                                      |
| `gauge`      | no       | How the Event moves a Gauge, e.g. `{ "role": "daily", "by": 1 }`.                                                                                                                                                                                     |
| `recognised` | no       | `false` for a kind your backend does not describe: the generic Gag plays.                                                                                                                                                                             |

Unknown fields inside an Event are refused, so a typo fails loudly. Never put personal data (names, e-mail addresses) in the words: the scene is a wallpaper, seen by anyone in the room.

## Status codes

| Status                      | What the app does                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `200`                       | Plays the new Events and saves `next_cursor`, even across restarts.                          |
| `304 Not Modified`          | Nothing new; keeps the cursor. Answer it when `If-None-Match` matches.                       |
| `401`                       | Stops and asks, in the menu bar, for a new token.                                            |
| `403`                       | Stops and says the token lacks the `read:events` permission.                                 |
| `410 Gone`                  | Forgets the cursor and asks again at once, from no cursor: use it when a cursor has expired. |
| `429`                       | Waits until `Retry-After` (seconds or a date), or `X-RateLimit-Reset`, then asks again.      |
| `5xx`, no answer, a timeout | Asks again later, further apart each time, up to 30 minutes.                                 |
| Any other status            | Asks again later the same way, and says in the menu bar to check the address.                |

After the Mac sleeps, the app asks at once from the saved cursor, so the Events of the night arrive in order on wake.

## Schema and examples

The format is published as a JSON Schema (draft 2020-12): [feed/feed-page.schema.json](feed/feed-page.schema.json). [feed/examples/valid](feed/examples/valid) holds answers the app accepts and [feed/examples/invalid](feed/examples/invalid) answers it refuses; the app's tests check every example against both the JSON Schema and the app's own validation, so the two never drift apart.

The same Event JSON is what a script posts to the Local webhook, with `id` optional there.
