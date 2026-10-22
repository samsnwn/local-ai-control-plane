## Security rules

- Never read, print, summarize, or transmit secrets from `.env` files, credentials files, private keys, certificates, or secret stores.
- Do not expose API keys, tokens, passwords, or other credentials in terminal output, logs, code changes, or responses.
- Use `.env.example` with placeholder values when inspecting environment configuration.
- Do not send secret values to external services.
- Ask for approval before running commands that access credentials, modify security settings, or transmit sensitive files.
- If a secret is accidentally exposed, stop and recommend rotating it.

## Product focus

- **M1 (current):** GitHub PR review agent — reusable library in `packages/pr-review-agent`, orchestration and persistence in `apps/control-plane-api`, contracts in `packages/contracts`.
- **Later:** private AI fleet (customer nodes). Do not expand fleet scope unless the task explicitly requires it.

## Repository

Monorepo with pnpm workspaces (`apps/*`, `packages/*`) orchestrated by Turborepo. Two language ecosystems: TypeScript (NestJS API + React/Vite web) and Python (`packages/pr-review-agent` via uv). Required: Node.js 24+, pnpm, Python 3.14+, uv, Docker.

## Commands (run from repo root)

- `pnpm install` — install all dependencies
- `pnpm exec turbo run <task>` — run build/dev/lint/test/typecheck across all workspaces
- `pnpm --filter control-plane-api <task>` — NestJS API only
- `pnpm --filter control-plane-web <task>` — React/Vite web only
- `cd packages/pr-review-agent && uv sync && uv run pytest && uv run ruff check . && uv run ruff format --check .` — Python package setup + tests + lint + format

Useful per-workspace tasks:

| Workspace           | Dev                                                         | Test                                                                                                                          | Typecheck                                       | Lint                                       | Build                                                                |
| ------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| `control-plane-api` | `pnpm --filter control-plane-api run start:dev` (port 3000) | `pnpm --filter control-plane-api run test` (vitest `*.spec.ts`)<br>`pnpm --filter control-plane-api run test:e2e` (supertest) | `pnpm --filter control-plane-api run typecheck` | `pnpm --filter control-plane-api run lint` | `pnpm --filter control-plane-api run build` (`nest build`)           |
| `control-plane-web` | `pnpm --filter control-plane-web run dev`                   | `pnpm --filter control-plane-web run test` (vitest, jsdom)                                                                    | `pnpm --filter control-plane-web run typecheck` | `pnpm --filter control-plane-web run lint` | `pnpm --filter control-plane-web run build` (`tsc -b && vite build`) |

## Verification order

`lint -> typecheck -> test -> build`. CI blocks PRs on failure; do not merge until all pass.

## Infrastructure

`docker compose up -d` starts PostgreSQL 18 (the only service). Copy `.env.example` to `.env` before starting. `.env` is gitignored — never commit it.

## Branch & PR conventions

Branches: `<type>/<issue>-description` — `feat`, `fix`, `docs`, `chore`, `refactor`. Example: `feat/43-node-communication-protocol`. Commits use Conventional Commits: `<type>(<scope>): <description>`. PRs must reference the issue (`Closes #`). CI blocks merge on failure.

## Architecture Decision Records (ADRs)

ADRs live in `docs/adr/`, use `docs/adr/template.md`, sequential four-digit IDs (`0001-`, `0002-`, etc.), statuses: `Proposed`, `Accepted`, `Superseded`, `Deprecated`.

Current:

| ADR  | Topic                          | Status   |
| ---- | ------------------------------ | -------- |
| 0001 | Initial technology stack       | Accepted |
| 0002 | Node communication (mTLS)      | Accepted |
| 0003 | Authentication / authorization | Proposed |
| 0004 | Persistence (Drizzle)          | Accepted |
| 0005 | Application naming             | Accepted |
| 0006 | Shared OpenAPI contracts       | Accepted |
| 0007 | Reusable PR review agent pkg   | Accepted |

## Tech quirks

- API imports use `.js` extensions (nodenext module resolution), e.g. `./app.module.js`.
- `pnpm-lock.yaml` and `packages/pr-review-agent/uv.lock` are committed — CI uses `--frozen-lockfile` / `--frozen`.
- Turbo caches `dist/**` and `build/**` outputs; `dev` is persistent and not cached.
- Control Plane API uses Drizzle ORM (`DatabaseModule`, `NodesModule`, `AuthModule` with `MtlsGuard`).
- Shared packages: `packages/eslint-config`, `packages/contracts`, `packages/pr-review-agent`.
- `packages/pr-review-agent` must never import Control Plane app code.
- Today the API HTTPS listener requests client certs globally (ADR-0002). M1 public webhook / agent Bearer routes need a separate listener or relaxed enforcement (see ADR-0003) before those endpoints ship.

## Documentation rule

- Always use Context7 when I need library/API documentation, code generation, setup, or configuration steps, without me having to explicitly ask.
