# Security policy

## Reporting a vulnerability

Please report security issues privately, never in a public issue or pull request. Use this repository's GitHub form **Security → Report a vulnerability** (private vulnerability reporting). Describe what you found, how to reproduce it, and what an attacker could do with it.

You will get a first answer within a week. Once a fix is released, the advisory is published with credit to you, unless you prefer to stay anonymous.

## Supported versions

Until the first release, only the `main` branch receives fixes. After it, the latest release does.

## What matters most here

The app will hold people's tokens for GitHub, Vercel, Stripe, Sentry, Linear and PostHog, and listen on a local port. Reports about any of these are especially welcome:

- a token leaving the macOS Keychain, reaching a log, a file or the screen;
- the local webhook accepting a request from another machine or without its secret;
- a Theme or the demo running markup or script that came from an Event;
- personal data (a name, an e-mail address) reaching the wallpaper.
