<p align="center">
  <img src="src/assets/images/IndieNodes_Logo.webp" alt="IndieNodes logo" width="220" />
</p>

<h1 align="center">IndieNodes Web</h1>

<p align="center">
  The project homepage for IndieNodes, a creator-first webring for independent creative work.
</p>

<p align="center">
  <a href="https://indienodes.us">Visit IndieNodes</a> ·
  <a href="#run-it-locally">Run locally</a> ·
  <a href="#build-and-deploy">Build and deploy</a>
</p>

## Overview

This repository builds the `indienodes.us` homepage with Eleventy. It introduces the
project and links visitors to the discovery app, which lives separately in
`indienodes-app` and is intended to run at `app.indienodes.us`.

The production output is plain HTML, CSS, fonts, images, and a small vanilla
JavaScript background animation. Shared layouts use Nunjucks templates; the site
needs no application server or client-side framework runtime.

## What it includes

- **A project introduction:** the creative media, principles, and “data is the API”
  approach behind IndieNodes.
- **Shared visual identity:** the app's logo, favicon, design tokens, and self-hosted
  Space Grotesk and Karla fonts, copied into this independent build.
- **An ambient background:** a vanilla JavaScript port of the app's Drifty Stars
  effect, without its audio-reactive behavior.
- **A portable container:** a static build served by Caddy, following the
  `indienodes-app` deployment pattern.

## Run it locally

Use Node.js 22 or newer and npm.

```bash
npm ci
npm run dev
```

### Common commands

| Command          | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `npm run dev`    | Start Eleventy's local development server      |
| `npm run build`  | Build the static production site into `_site/` |
| `npm run format` | Format the project with Prettier               |

## Build and deploy

The included [Dockerfile](./Dockerfile) installs locked dependencies, builds the
site with Node.js 22, and copies only the static output into a Caddy 2 runtime.
[Caddyfile](./Caddyfile) serves HTTP on port **8080**, with compression and a
health check against `/`. The runtime runs as a non-root numeric user, defaulting
to UID/GID `1000:1000`; Infra can override these with the `PUID` and `PGID` build
arguments.

```bash
docker build -t indienodes-web .
docker run -d --name indienodes-web -p 8080:8080 indienodes-web
```

For local Compose use:

```bash
docker compose up --build -d
```

[docker-compose.yml](./docker-compose.yml) sets the container name to
`indienodes-web`. Set `PORT` to change the published host port; the container
always listens on 8080. No host paths, external Docker networks, or CPU
architecture are prescribed. Infra supplies routing, TLS termination, restart
policy, and registry/image selection in its deployment configuration.

The build stage uses `$BUILDPLATFORM` because the generated site is architecture
independent. The runtime follows the requested target platform. Infra can publish
an image for multiple Linux architectures using Buildx, for example (replace the
registry and tag with the deployment's values):

```bash
docker buildx build --platform linux/amd64,linux/arm64 \
  -t YOUR_REGISTRY/indienodes-web:YOUR_TAG --push .
```

### Site configuration

Links and shared metadata live in [`src/_data/site.js`](./src/_data/site.js).
**Before launching the homepage at `indienodes.us`, update `appUrl` to
`https://app.indienodes.us` once the app is deployed there.** It currently points
to `https://indienodes.us`. Review `githubUrl` there as well when finalizing the
repository's public location.

These values are compiled into the static pages. Change the source and rebuild
the image to update them; container environment variables do not rewrite the
site at runtime.

## Project structure

| Path                     | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `src/index.njk`          | Homepage content                                |
| `src/_includes/base.njk` | Shared page layout                              |
| `src/_data/site.js`      | App links and shared metadata                   |
| `src/assets/`            | Styles, fonts, logo, and background script      |
| `.eleventy.js`           | Build configuration and asset copying           |
| `_site/`                 | Generated output, excluded from version control |
