# dc-agent-react

Web UI (control plane) for **dc-operator** — a data center management console. It lets you inspect deployed applications and their services, follow logs, and manage the deployment Git repository.

The UI talks to the backend agent over a JSON HTTP API. The backend lives in a separate repository:

- **Backend:** [evsinev/dc-agent](https://github.com/evsinev/dc-agent)

## Features

The left navigation exposes four sections:

- **App list** — all deployed applications with live status indicators; drill into an app to see its services, per‑service status, and log tail.
- **Service list** — all services across hosts, with actions and status.
- **Git repo** — browse commits and pull the deployment repository.
- **Logs** — live, auto‑refreshing log viewer.

## Tech stack

- [React 19](https://react.dev/) + [React Router 7](https://reactrouter.com/)
- [Rsbuild](https://rsbuild.dev/) (Rspack-based bundler and dev server)
- [TypeScript 7](https://www.typescriptlang.org/) (native compiler, type checking only — transpilation is done by Rsbuild)
- [Cloudscape Design System](https://cloudscape.design/) components and global styles
- [SWR](https://swr.vercel.app/) for data fetching, [Zustand](https://zustand-demo.pmnd.rs/) for UI state
- [Zod](https://zod.dev/) for schema validation, [Pino](https://getpino.io/) for logging
- [Biome](https://biomejs.dev/) for linting and formatting

## Prerequisites

- **Node.js** ≥ 20 (the TypeScript 7 compiler requires ≥ 16.20)
- **Yarn** 1.22.x (pinned via `packageManager` in `package.json`)
- A running **dc-agent** backend (see below) reachable for API requests

## Getting started

```bash
# install dependencies
yarn install

# start the dev server (http://localhost:3000, base path /dc-operator)
yarn dev
```

The dev server proxies API calls from `/dc-operator/api` to the backend at `http://localhost:8052` (see `rsbuild.config.ts`). Start the [dc-agent](https://github.com/evsinev/dc-agent) backend on that port for the UI to work locally.

## Scripts

| Command        | Description                                         |
|----------------|-----------------------------------------------------|
| `yarn dev`     | Start the Rsbuild dev server (development env mode) |
| `yarn build`   | Production build into `dist/`                       |
| `yarn preview` | Serve the production build locally                  |
| `yarn lint`    | `biome lint` + `tsc --noEmit` (type check)          |
| `yarn format`  | Report Biome formatting differences                 |

## Environment variables

Environment is loaded from `.env.development` / `.env.production` (see `--env-mode`). Variables that must reach the browser are prefixed with `PUBLIC_`:

| Variable                       | Example            | Description                              |
|--------------------------------|--------------------|------------------------------------------|
| `PUBLIC_BASE_PATH`             | `/dc-operator`     | Router base path the app is served under |
| `PUBLIC_API_BASE_URL`          | `/dc-operator/api` | Base URL prepended to all API requests   |
| `PUBLIC_LOGS_REFRESH_INTERVAL` | `2000`             | Log viewer auto-refresh interval, in ms  |

## Project structure

```
src/
├── app/                # App shell: layout, routing, navigation, panels, global styles
│   ├── router/         # Route table and route path config (routing.ts)
│   └── components/     # AppLayout building blocks (nav, breadcrumbs, split/help panels)
├── pages/              # Feature pages (app-list, app-view, service-list, service-view, git, logs, …)
│   └── <page>/
│       ├── api/        # SWR data hooks / API calls for the page
│       └── components/ # Page-specific UI
├── components/         # Shared UI (error boundary, info popovers, labels)
├── hooks/              # Reusable hooks (query params, split/help panel, window callbacks)
├── libs/               # Low-level helpers (client-post API client, logger, filters)
└── env.d.ts            # Ambient module declarations (assets, styles)
```
