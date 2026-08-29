# Local AI Control Plane

Monorepo for the Local AI Control Plane project.

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

Set up the Python environment:

    cd packages/python
    uv sync
    cd ../..

Configure the local environment:

    cp .env.example .env

## Project Structure

    local-ai-control-plane/
    ├── apps/
    │   ├── api/
    │   └── web/
    ├── packages/
    │   ├── eslint-config/
    │   └── python/
    ├── infrastructure/
    ├── docs/
    ├── .github/
    ├── .env.example
    ├── docker-compose.yml
    └── README.md

## Development

Run all development tasks through Turbo:

    pnpm exec turbo run dev

Run a specific application:

    pnpm --filter api run start:dev
    pnpm --filter web run dev

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

### Environment Variables

Local environment files must not be committed.

Copy the example environment file before starting the infrastructure:

    cp .env.example .env

PostgreSQL configuration is controlled through the following variables:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`

## Linting

The repository uses ESLint for TypeScript/JavaScript projects.

Run linting for all workspaces:

    pnpm exec turbo run lint

Run linting for a specific application:

    pnpm --filter api run lint
    pnpm --filter web run lint

Python uses Ruff:

    cd packages/python
    uv run ruff check .
    uv run ruff format --check .
    cd ../..

## Formatting

Format Python code with Ruff:

    cd packages/python
    uv run ruff format .
    cd ../..

TypeScript formatting is handled by the existing Prettier configuration in the respective applications.

## Testing

Run the TypeScript test suites:

    pnpm exec turbo run test

Run Python tests:

    cd packages/python
    uv run pytest
    cd ../..

## Building

Build all applications:

    pnpm exec turbo run build

## Python Environment

The Python workspace uses `uv` for dependency management and Python 3.14.

The lockfile is committed to the repository to ensure reproducible environments.

    cd packages/python

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

    cd packages/python
    uv run ruff check .
    uv run ruff format --check .
    uv run pytest
    cd ../..

All commands should complete successfully before submitting changes.

## Scope

This repository currently contains the monorepo foundation, development tooling, and local development infrastructure.

The following are intentionally out of scope at this stage:

- Local LLM integration
- RAG
- Node registration
- Control Plane functionality
- Database schemas
- Dockerized application deployment
- Production databases
- VPN or remote networking
- Monitoring infrastructure
- Production infrastructure