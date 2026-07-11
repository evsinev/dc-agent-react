# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Web UI (control plane) for **dc-operator**, a data center management console. It is a client-only React SPA that talks to the **dc-agent** backend (https://github.com/evsinev/dc-agent) over a JSON HTTP API. There is no server code in this repo.

## Commands

Package manager is **Yarn 1** (`packageManager: yarn@1.22.22`). Use `yarn`, not npm.

```bash
yarn install          # install deps
yarn dev              # Rsbuild dev server on :3000, base path /dc-operator
yarn build            # production build into dist/
yarn preview          # serve the production build
yarn lint             # biome lint && tsc --noEmit  (the quality gate)
yarn format           # biome format (prints diffs; does NOT write)
```

There are **no tests** in this project.

Before considering a change done, run `yarn lint` — it is the enforced gate (Biome lint + full TypeScript type check). Formatting is checked separately (`yarn format`) and is **not** part of that gate.

## Toolchain specifics

- **TypeScript 7** (the native compiler). It only type-checks (`noEmit`); Rsbuild does the actual transpilation. Consequences that differ from older TS:
  - `moduleResolution` is `bundler`, so the `exports` map of dependencies is respected. Deep imports into a package's internal subpaths (e.g. `.../side-navigation/interfaces`) fail — import types from the public entry point instead (`.../side-navigation`).
  - `baseUrl` is not used; all `paths` entries must be relative (`./src/*`).
  - Ambient module declarations for assets/styles live in `src/env.d.ts` (references `@rsbuild/core/types` plus plain `*.css` for side-effect stylesheet imports).
- **Biome** (not ESLint/Prettier) for lint + format, configured in `biome.json`: single quotes, 120-col, `dist` is ignored. Suppress a rule inline with `// biome-ignore <rule>: <reason>`.

## Path aliases

Two aliases, defined in **two places that must stay in sync**:

- `@/*` → `src/*` — general source imports.
- `@routing` → the route-path table.

They are declared in both `tsconfig.json` (`compilerOptions.paths`) and `rsbuild.config.ts` (`resolve.alias`). Note a current inconsistency: tsconfig maps `@routing` to `src/app/router/routing.ts` (the file that exists), while `rsbuild.config.ts` maps it to `src/app/router/config.ts`. Prefer `routing.ts`; reconcile the two if you touch routing.

## Architecture

**App shell** (`src/app/`): `index.tsx` mounts `<App>`, which composes the Cloudscape `AppLayout` (navigation, breadcrumbs, split panel, help/tools panel) around `<Router>` and wraps everything in `<ErrorProvider>` and an i18n provider. `BrowserRouter` uses `PUBLIC_BASE_PATH` as its `basename`.

**Routing**: route paths are centralized in `src/app/router/routing.ts` (imported everywhere as `@routing`); the `<Routes>` table is in `src/app/router/index.tsx`. Nav menu items are in `src/app/components/navigation.tsx`.

**Pages** (`src/pages/<name>/`) follow a consistent convention:
- `index.tsx` — the page component
- `api/` — data access: SWR hooks + `clientPost` calls
- `components/` — page-specific UI

Feature pages: `app-list`, `app-view`, `service-list`, `service-view`, `git`, `logs` (plus `test`, `not-found`).

**Data flow / backend API**: all backend calls go through `clientPost` in `src/libs/client-post.ts` — every request is a `POST` with a JSON body, prefixed with `PUBLIC_API_BASE_URL`. Pages wrap these calls in **SWR** hooks (see each page's `api/` folder). On a non-OK response `clientPost` throws a typed `RequestError` (`src/components/error/models/`), which is surfaced by the global `ErrorProvider` (`src/components/error/`). Backend error shapes are not yet uniform — `client-post.ts` has TODOs normalizing `errorId`/`errorCorrelationId` and `type`/`errorMessage`.

**UI panel state**: the split panel and help/tools panel are driven by small **Zustand** stores in `src/hooks/use-split-panel.tsx` and `src/hooks/use-help-panel.ts`, read by the `AppLayout` in `app.tsx`.

**Logging**: `src/libs/logger.ts` wraps **Pino**.

## Environment

Env is loaded from `.env.development` / `.env.production` via `--env-mode`. Only variables prefixed `PUBLIC_` reach the browser: `PUBLIC_BASE_PATH`, `PUBLIC_API_BASE_URL`, `PUBLIC_LOGS_REFRESH_INTERVAL`. In dev, Rsbuild proxies `/dc-operator/api` → `http://localhost:8052` (`rsbuild.config.ts`), so the dc-agent backend must be running there for the UI to function locally.
