## Security rules

- Never read, print, summarize, or transmit secrets from `.env` files, credentials files, private keys, certificates, or secret stores.
- Do not expose API keys, tokens, passwords, or other credentials in terminal output, logs, code changes, or responses.
- Use `.env.example` with placeholder values when inspecting environment configuration.
- Do not send secret values to external services.
- Ask for approval before running commands that access credentials, modify security settings, or transmit sensitive files.
- If a secret is accidentally exposed, stop and recommend rotating it.

## Repository

Monorepo with pnpm workspaces (`apps/*`, `packages/*`) orchestrated by Turborepo. Two language ecosystems: TypeScript (NestJS API + React/Vite web) and Python (uv workspace). Required: Node.js 24+, pnpm, Python 3.14+, uv, Docker.

## Commands (run from repo root)

- `pnpm install` — install all dependencies
- `pnpm exec turbo run <task>` — run build/dev/lint/test/typecheck across all workspaces
- `pnpm --filter control-plane-api <task>` — NestJS API only
- `pnpm --filter control-plane-web <task>` — React/Vite web only
- `cd packages/python && uv sync && uv run pytest && uv run ruff check . && uv run ruff format --check .` — Python setup + tests + lint + format

Useful per-workspace tasks:

| Workspace | Dev | Test | Typecheck | Lint | Build |
|-----------|-----|------|-----------|------|-------|
| `control-plane-api` | `pnpm --filter control-plane-api run start:dev` (port 3000) | `pnpm --filter control-plane-api run test` (vitest `*.spec.ts`)<br>`pnpm --filter control-plane-api run test:e2e` (supertest) | `pnpm --filter control-plane-api run typecheck` | `pnpm --filter control-plane-api run lint` | `pnpm --filter control-plane-api run build` (`nest build`) |
| `control-plane-web` | `pnpm --filter control-plane-web run dev` | `pnpm --filter control-plane-web run test` (vitest, jsdom) | `pnpm --filter control-plane-web run typecheck` | `pnpm --filter control-plane-web run lint` | `pnpm --filter control-plane-web run build` (`tsc -b && vite build`) |

## Verification order

`lint -> typecheck -> test -> build`. CI blocks PRs on failure; do not merge until all pass.

## Infrastructure

`docker compose up -d` starts PostgreSQL 18 (the only service). Copy `.env.example` to `.env` before starting. `.env` is gitignored — never commit it.

## Tech quirks

- API imports use `.js` extensions (nodenext module resolution), e.g. `./app.module.js`.
- `pnpm-lock.yaml` and `packages/python/uv.lock` are committed — CI uses `--frozen-lockfile` / `--frozen`.
- Turbo caches `dist/**` and `build/**` outputs; `dev` is persistent and not cached.
- No ORM or database client is installed in the API yet (`AppModule` has `imports: []`).
- No shared API contract package exists yet; `packages/eslint-config` is the only shared package.
