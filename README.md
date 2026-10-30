# Local AI Control Plane

Monorepo for the Local AI Control Plane project.

**Near-term product (M1):** Control Plane API development — NestJS management
API, Drizzle persistence, OpenAPI contracts, and the node-registration building
block. The Control Plane is the primary development focus.

**Longer-term direction:** reusable AI agents and the private AI fleet manager
(customer nodes + control plane). Agent and fleet features are deferred until
the Control Plane is demonstrable.

## Prerequisites

- Node.js 24+
- pnpm
- Docker
- Docker Compose

## Getting Started

Clone the repository and install the dependencies:

    pnpm install

Configure the local environment:

    cp .env.example .env

## Project Structure

    local-ai-control-plane/
    ├── apps/
    │   ├── control-plane-api/     # NestJS Control Plane API
    │   └── control-plane-web/     # React/Vite operator UI (scaffold)
    ├── packages/
    │   ├── contracts/             # OpenAPI contracts (spec-driven)
    │   └── eslint-config/
    ├── docs/
    ├── .github/
    ├── .env.example
    ├── docker-compose.yml
    └── README.md

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

## Formatting

TypeScript formatting is handled by Prettier at the repository root.

## Testing

Run the TypeScript test suites:

    pnpm exec turbo run test

Run the API end-to-end tests (requires the local PostgreSQL container and applied migrations):

    pnpm --filter control-plane-api run test:e2e

## Building

Build all applications:

    pnpm exec turbo run build

## Verification

Validate the Docker Compose configuration:

    docker compose config

Start the local infrastructure:

    docker compose up -d

Check the infrastructure status:

    docker compose ps

Run the repository lint and build checks:

    pnpm exec turbo run lint build

All commands should complete successfully before submitting changes.

## Scope

### In place today

- Monorepo tooling (pnpm, Turborepo, CI)
- Local PostgreSQL via Docker Compose
- Control Plane API with Drizzle schema/migrations
- mTLS-backed `POST /nodes/register` (early fleet building block)
- OpenAPI contracts package (endpoints specified)

### Near-term (M1) — in progress

- Control Plane management API endpoints
- Node registration / heartbeat building blocks
- APIs aligned to `packages/contracts`

### Deferred

- Customer node fleet management (heartbeats, remote execution)
- Operator UI beyond the Vite scaffold
- Production deployment, VPN, monitoring
- Local LLM / RAG on customer nodes
