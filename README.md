# Mashghal (مشغل)

> Dashboard and control center for the local print & craft workshop's docker apps.

*Mashghal* is Arabic for "workshop" or "atelier." This app is the front door to the workshop: a single page with links to every app plus a live "is it running" status, and a single command to bring the whole workshop up or down.

## Overview

The workshop is a handful of independently developed, independently deployed apps, each with its own git repo and its own `docker-compose.yml`, plus at least one physical device on the network:

| App | Repo (relative to this one) | URL |
| --- | --- | --- |
| Chocolate Mold Factory | `../chocolate-mold-factory` | http://localhost:3000 |
| Platesmith | `../platesmith` | http://localhost:8001 |
| Spoolman | `../../3d-printing-workshop` | http://localhost:18000 |
| OctoPrint | *(runs on `theforge`, not in Docker here)* | http://theforge.local:5000/ |

Mashghal doesn't own or absorb any of those apps' code or compose files — it just links to them and watches them. That keeps each app free to evolve on its own, while Mashghal stays the one place you look (and the one command you run) to see and control the whole workshop.

## Features

- **Dashboard**: a card per app with a link (or links, for apps with more than one service) and a status dot (online / partially running / stopped / not started), polled every 15 minutes.
- **Start/stop from the card**: apps running on this Docker host get a play/stop button that starts or stops their container directly, no terminal needed. It only works on a container that's already been created at least once (see [How status works](#how-status-works)); apps that aren't containers here (OctoPrint) don't get this control.
- **Per-app monitoring toggle**: each card has an eye / eye-off button for apps you don't want checked right now (e.g. a device that's intentionally offline). The backend skips checking that app entirely rather than checking and hiding it, and the status line keeps showing whatever it last knew rather than switching to some "off" state. The preference is remembered per-browser in `localStorage`, not shared or persisted server-side.
- **Check now**: a refresh button forces a live check for one app on demand (bypassing the 15-minute poll and the monitoring toggle), without changing the monitoring preference.
- **Spoolman inventory summary**: the Spoolman card shows a live spool count and total remaining filament weight, pulled from its REST API while it's running.
- **One-command startup**: `./scripts/start.sh` builds and starts every sibling app's compose project, then the dashboard itself — the "everything back up after a reboot" button.
- **One-command shutdown**: `./scripts/stop.sh` does the reverse.
- **Version badge**: the header shows Mashghal's own version, read from `package.json`, matching the other apps in the workshop.

### Roadmap

- Surface recent events/logs per app (build on the same Docker socket access already used for status).
- More per-app summaries beyond Spoolman (e.g. low-stock spools, breakdown by material).

## How status works

Each entry in [src/config/apps.js](src/config/apps.js) is checked one of two ways:

- **Local Docker apps** (`containers: [...]`) — the dashboard container mounts the host's Docker socket (`/var/run/docker.sock`) and uses [dockerode](https://github.com/apocas/dockerode) to inspect those specific containers. A container that isn't found (never created, or removed by `docker compose down`) is reported as "not started" rather than an error.
- **Apps not running in this Docker host** (`healthUrl: "..."`) — e.g. OctoPrint, which runs on a separate device (`theforge`) on the LAN — get a plain HTTP reachability check against that URL with a short timeout instead. This relies on the dashboard's container being able to resolve `.local` (mDNS) hostnames, which works out of the box on Docker Desktop for Mac.

The same socket backs the start/stop buttons ([src/dockerControl.js](src/dockerControl.js)), which call `start`/`stop` on those same containers by name. That only works if the container already exists — it can't run `docker compose up` for you from inside the container, since that needs the sibling app's own compose file and build context, which Mashghal doesn't have access to (and deliberately doesn't reach across the network for). If a container was never created, or was removed with `docker compose down`, its Start button is disabled with a tooltip pointing at `./scripts/start.sh`, which does have that access.

Mounting the socket hands the dashboard container the same privileges as the Docker CLI on the host — the `:ro` flag only stops it from replacing the socket file itself, it doesn't put the Docker API in any kind of read-only mode. Treat this like any other tool with root-equivalent access: keep the port off the public internet and don't add untrusted code to this repo.

## Per-app data (e.g. Spoolman's stats)

Beyond status, an app's card can show a small live summary pulled from that app's own API — currently just Spoolman's spool count and remaining filament weight (see [src/integrations/spoolman.js](src/integrations/spoolman.js)).

This is fetched from *inside* the dashboard's container, which is a different network namespace than your browser. A link on the page correctly points the browser at `http://localhost:<port>`, but the dashboard backend has to reach that same published port via Docker Desktop's host gateway instead: `http://host.docker.internal:<port>`. Keep that distinction in mind when wiring up a similar integration for another app — `links` stay `localhost`, but any URL the *server* fetches from should use `host.docker.internal` (or the real hostname, for something like OctoPrint that isn't on this Docker host at all).

## Prerequisites

- Docker Desktop (or another Docker Engine + Compose v2 install).
- The sibling app repos cloned locally. By default Mashghal expects the layout above (two siblings next to this repo under the same parent directory, and `3d-printing-workshop` one level further up) — override this in `.env` if your checkouts live elsewhere.

## Getting started

```bash
cp .env.example .env   # adjust paths/ports if your checkouts differ from the default layout
./scripts/start.sh
```

Then open http://localhost:4000.

To run only the dashboard (leaving the other apps' lifecycle to themselves):

```bash
docker compose up --build -d
```

To stop everything:

```bash
./scripts/stop.sh
```

### Local development (without Docker)

```bash
npm install
npm run dev   # starts the server with --watch on http://localhost:4000
```

This still talks to the Docker socket directly (`/var/run/docker.sock` on macOS/Linux with Docker Desktop), so container statuses work the same as in the containerized version.

## Configuration

All configuration lives in `.env` (see `.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `DASHBOARD_PORT` | `4000` | Host port the dashboard is served on. |
| `CHOCOLATE_MOLD_FACTORY_PATH` | `../chocolate-mold-factory` | Path to that repo, used by the start/stop scripts. |
| `PLATESMITH_PATH` | `../platesmith` | Path to that repo, used by the start/stop scripts. |
| `THREED_PRINTING_WORKSHOP_PATH` | `../../3d-printing-workshop` | Path to that repo, used by the start/stop scripts. |

## Project layout

```
src/
  server.js          Express app: serves the static dashboard + the /api routes
  dockerClient.js     The shared dockerode instance
  dockerStatus.js     Docker socket / HTTP checks -> per-app status summary
  dockerControl.js    Docker socket start/stop for a container-backed app
  config/apps.js      The registry of apps, their links, and how to check each one
public/
  index.html, styles.css, app.js   The dashboard frontend (no build step)
  icons/                           Each app's icon, saved locally rather than hotlinked
scripts/
  start.sh, stop.sh   Bring the whole workshop up/down together
```

## Adding a new app to the dashboard

1. Add an entry to [src/config/apps.js](src/config/apps.js) with its `name`, `description`, and `links`. For status, set either `containers` (container names as shown in `docker ps`, for an app running on this Docker host) or `healthUrl` (for a device or app elsewhere on the network). If it has an icon, save it under `public/icons/` and reference it via `icon` — icons are stored locally rather than hotlinked from the running app.
2. If it's a local compose project that should be started/stopped by the scripts, add a `*_PATH` variable for it in `.env.example` and reference it in `scripts/start.sh` / `scripts/stop.sh`.
