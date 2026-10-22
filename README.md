# Local AI Control Plane

Monorepo for the Local AI Control Plane project.

**Near-term product (M1):** a self-hosted GitHub PR review agent, orchestrated by
the Control Plane API, with a reusable Python library in `packages/pr-review-agent`.

**Longer-term direction:** a private AI fleet manager (customer nodes + control
plane). Fleet features are deferred until after M1.

## Prerequisites

- Node.js 24+
- pnpm
- Python 3.14+
- uv
- Docker
- Docker Compose

## Getting Started

Clone the repository and install the dependencies:

    pnpm install

Set up the reusable PR review agent (Python):

    cd packages/pr-review-agent
    uv sync
    cd ../..

Configure the local environment:

    cp .env.example .env

## Project Structure

    local-ai-control-plane/
    ├── apps/
    │   ├── control-plane-api/     # NestJS Control Plane API
    │   └── control-plane-web/     # React/Vite operator UI (scaffold)
    ├── packages/
    │   ├── contracts/             # OpenAPI contracts (spec-driven)
    │   ├── eslint-config/
    │   └── pr-review-agent/       # Reusable GitHub PR review library
    ├── docs/
    ├── .github/
    ├── .env.example
    ├── docker-compose.yml
    └── README.md

Optional later (create only when needed): `apps/review-agent` (thin runner),
`apps/node-agent`, `apps/node-api`, `infrastructure/` deploy configs.

## Development

Run all development tasks through Turbo:

    pnpm exec turbo run dev

Run a specific application:

    pnpm --filter control-plane-api run start:dev
    pnpm --filter control-plane-web run dev

## Local Infrastructure

The project uses Docker Compose to provide the required local development infrastructure.

### PostgreSQL

PostgreSQL is provided through Docker Compose and does not need to be installed locally.

Start the local infrastructure:

    docker compose up -d

Check the running services:

    docker compose ps

Stop the local infrastructure:

    docker compose down

PostgreSQL data is stored in a Docker named volume and is preserved when using `docker compose down`.

Reset the database completely (destroys the volume, re-initializes it, and applies all migrations):

    pnpm db:reset

Apply pending migrations to a running database:

    pnpm db:migrate

### Environment Variables

Local environment files must not be committed.

Copy the example environment file before starting the infrastructure:

    cp .env.example .env

PostgreSQL configuration is controlled through the following variables:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `DATABASE_URL` — connection string used by the API and drizzle-kit; keep it in
  sync with the `POSTGRES_*` values above

The API loads the repository-root `.env` file at startup; real environment
variables take precedence over values from the file. The API and drizzle-kit
fail to start when `DATABASE_URL` is not set.

## Linting

The repository uses ESLint for TypeScript/JavaScript projects.

Run linting for all workspaces:

    pnpm exec turbo run lint

Run linting for a specific application:

    pnpm --filter control-plane-api run lint
    pnpm --filter control-plane-web run lint

Python uses Ruff:

    cd packages/pr-review-agent
    uv run ruff check .
    uv run ruff format --check .
    cd ../..

## Formatting

Format Python code with Ruff:

    cd packages/pr-review-agent
    uv run ruff format .
    cd ../..

TypeScript formatting is handled by Prettier at the repository root.

## Testing

Run the TypeScript test suites:

    pnpm exec turbo run test

Run the API end-to-end tests (requires the local PostgreSQL container and applied migrations):

    pnpm --filter control-plane-api run test:e2e

Run Python tests:

    cd packages/pr-review-agent
    uv run pytest
    cd ../..

## Building

Build all applications:

    pnpm exec turbo run build

## Python Environment

The reusable PR review agent uses `uv` for dependency management and Python 3.14.

The lockfile (`packages/pr-review-agent/uv.lock`) is committed to the repository.

    cd packages/pr-review-agent

    uv sync
    uv run pytest
    uv run ruff check .
    uv run ruff format --check .

## Verification

Validate the Docker Compose configuration:

    docker compose config

Start the local infrastructure:

    docker compose up -d

Check the infrastructure status:

    docker compose ps

Run the repository lint and build checks:

    pnpm exec turbo run lint build

Run the Python checks:

    cd packages/pr-review-agent
    uv run ruff check .
    uv run ruff format --check .
    uv run pytest
    cd ../..

All commands should complete successfully before submitting changes.

## Scope

### In place today

- Monorepo tooling (pnpm, Turborepo, CI)
- Local PostgreSQL via Docker Compose
- Control Plane API with Drizzle schema/migrations
- mTLS-backed `POST /nodes/register` (early fleet building block)
- OpenAPI contracts package (M1 endpoints specified)
- Reusable `pr-review-agent` package scaffold (models + tests)

### Near-term (M1) — in progress

- GitHub webhook ingestion and HMAC verification
- Review run / findings APIs aligned to `packages/contracts`
- PR review pipeline inside `packages/pr-review-agent`
- Publishing findings back to GitHub

### Deferred

- Customer node fleet management (heartbeats, remote execution)
- Operator UI beyond the Vite scaffold
- Production deployment, VPN, monitoring
- Local LLM / RAG on customer nodes
