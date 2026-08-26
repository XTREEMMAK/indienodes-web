# IndieNodes — project homepage

The `indienodes.us` front door. Static [Eleventy](https://www.11ty.dev/) site — no
framework runtime shipped, output is plain HTML/CSS with one small vanilla-JS file.

The discovery app itself (the field view, `/join`, `/members`, everything
interactive) lives in a separate repository (`indienodes_v2`) and is intended to run
at `app.indienodes.us`. This repo does not build or embed that app; every link to it
is a plain `<a href>` to `site.appUrl` (`src/_data/site.js`) — update that one value
once `app.indienodes.us` is live.

## Why a separate repo, and why Eleventy rather than the app's own SvelteKit

Recorded in `indienodes_v2`'s `docs/decisions.md` ("The root route stays the app...").
Short version: this is an info page with a handful of nav targets (home today; a
privacy notice and Terms of Use are known future pages), not an application — it
doesn't need client-side routing, hydration, or a component framework. Eleventy
gives shared layout/nav/footer via includes without any of that, and the output is
exactly as static as hand-written HTML.

## What's ported from the app, and how

Design tokens (`src/assets/css/style.css`), the two self-hosted variable fonts
(`src/assets/fonts/`, taken from the `@fontsource-variable` packages the app already
uses, not re-fetched from a CDN — this repo has no npm dependency on those packages,
just their font files), the logo, and the favicon are all copied by value, not
shared by import: this is a genuinely separate build with no shared toolchain.

The Drifty Stars background (`src/assets/js/drifty-stars.js`) is a vanilla-JS port
of `AmbientBackground.svelte`, with the audio-reactive drift boost and big-hit
particle burst deliberately dropped — both exist there because that app has an
audio player; this page never does.

Copy (the hero, the four content types, the "data is the API" thesis, the five
principles) is lifted from the app's own `AboutModal.svelte` and `README.md` rather
than freshly written, so the two sites say the same thing in the same voice.

## Running locally

```bash
npm install
npm run dev     # eleventy --serve
npm run build   # outputs to _site/
```

## Deploying

Static output, so any static file host works — the same Caddy-serves-a-directory
shape `indienodes_v2` already uses (`try_files {path} {path}.html`) is a drop-in
fit; `_site/index.html` is the only route that exists today.
