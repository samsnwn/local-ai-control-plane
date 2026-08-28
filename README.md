# Local AI Control Plane

Monorepo for the Local AI Control Plane project.

## Prerequisites

* Node.js 24+
* pnpm
* Python 3.14+
* uv

## Getting Started

Clone the repository and install the dependencies:

```bash
pnpm install
```

Set up the Python environment:

```bash
cd packages/python
uv sync
cd ../..
```

## Project Structure

```text
local-ai-control-plane/
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   └── eslint-config/
├── docs/
├── .github/
└── .env.example
```

## Development

Run all development tasks through Turbo:

```bash
pnpm exec turbo run dev
```

Run a specific application:

```bash
pnpm --filter api run start:dev
pnpm --filter web run dev
```

## Linting

The repository uses ESLint for TypeScript/JavaScript projects.

Run linting for all workspaces:

```bash
pnpm exec turbo run lint
```

Run linting for a specific application:

```bash
pnpm --filter api run lint
pnpm --filter web run lint
```

Python uses Ruff:

```bash
cd packages/python
uv run ruff check .
uv run ruff format --check .
cd ../..
```

## Formatting

Format Python code with Ruff:

```bash
cd packages/python
uv run ruff format .
cd ../..
```

TypeScript formatting is handled by the existing Prettier configuration in the respective applications.

## Testing

Run the TypeScript test suites:

```bash
pnpm exec turbo run test
```

Run Python tests:

```bash
cd packages/python
uv run pytest
cd ../..
```

## Building

Build all applications:

```bash
pnpm exec turbo run build
```

## Environment Variables

Local environment files must not be committed.

Use `.env.example` as the template for environment configuration:

```bash
cp .env.example .env
```

Application-specific environment variables will be documented as they are introduced.

## Python Environment

The Python workspace uses `uv` for dependency management and Python 3.14.

The lockfile is committed to the repository to ensure reproducible environments.

```bash
cd packages/python

uv sync
uv run pytest
uv run ruff check .
uv run ruff format --check .
```

## Scope

This repository currently contains the monorepo foundation and development tooling.

The following are intentionally out of scope at this stage:

* Local LLM integration
* RAG
* Node registration
* Control Plane functionality
* Database schemas
* Dockerized application deployment
* Production infrastructure
