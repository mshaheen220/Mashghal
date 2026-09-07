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

- **Dashboard**: a card per app with a link (or links, for apps with more than one service) and a status dot (online / partially running / stopped / not started), polled every 60 seconds.
- **One-command startup**: `./scripts/start.sh` builds and starts every sibling app's compose project, then the dashboard itself — the "everything back up after a reboot" button.
- **One-command shutdown**: `./scripts/stop.sh` does the reverse.

### Roadmap

- Surface recent events/logs per app (build on the same Docker socket access already used for status).
- Start/stop individual apps from the dashboard UI instead of only from the CLI scripts.

## How status works

Each entry in [src/config/apps.js](src/config/apps.js) is checked one of two ways:

- **Local Docker apps** (`containers: [...]`) — the dashboard container mounts the host's Docker socket (`/var/run/docker.sock`) read-only and uses [dockerode](https://github.com/apocas/dockerode) to inspect those specific containers. A container that isn't found (never started) is reported as "not started" rather than an error.
- **Apps not running in this Docker host** (`healthUrl: "..."`) — e.g. OctoPrint, which runs on a separate device (`theforge`) on the LAN — get a plain HTTP reachability check against that URL with a short timeout instead. This relies on the dashboard's container being able to resolve `.local` (mDNS) hostnames, which works out of the box on Docker Desktop for Mac.

This means Mashghal only ever *reads* state for now — it doesn't start or stop anything through the socket yet. Mounting the socket still hands the dashboard container the same privileges as the Docker CLI on the host, so treat it like any other tool with root-equivalent access: keep the port off the public internet and don't add untrusted code to this repo.

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
  server.js          Express app: serves the static dashboard + /api/apps
  dockerStatus.js     Docker socket / HTTP checks -> per-app status summary
  config/apps.js      The registry of apps, their links, and how to check each one
public/
  index.html, styles.css, app.js   The dashboard frontend (no build step)
scripts/
  start.sh, stop.sh   Bring the whole workshop up/down together
```

## Adding a new app to the dashboard

1. Add an entry to [src/config/apps.js](src/config/apps.js) with its `name`, `description`, and `links`. For status, set either `containers` (container names as shown in `docker ps`, for an app running on this Docker host) or `healthUrl` (for a device or app elsewhere on the network).
2. If it's a local compose project that should be started/stopped by the scripts, add a `*_PATH` variable for it in `.env.example` and reference it in `scripts/start.sh` / `scripts/stop.sh`.
