# Repository Structure and Technology Boundaries

## Overview

Local AI Control Plane uses a monorepo containing applications, shared contracts,
reusable libraries, and project documentation.

The monorepo simplifies development and integration while keeping clear
boundaries between:

1. **Control Plane** applications
2. **Reusable agent libraries** (portable to other projects)
3. **Customer Node** applications (deferred until after M1)

Being in the same repository does not mean that all components form a single
application or deployment unit.

---

## Near-term product focus

**M1** delivers a GitHub PR review capability:

- Review logic lives in `packages/pr-review-agent` (reusable library).
- Orchestration, webhooks, and persistence live in `apps/control-plane-api`.
- Cross-language HTTP shapes live in `packages/contracts`.

Fleet/node apps are documented as future targets only.

---

## Target Repository Structure

```text
local-ai-control-plane/
├── apps/
│   ├── control-plane-api/
│   ├── control-plane-web/
│   ├── review-agent/          # optional thin runner for this monorepo
│   ├── node-agent/            # deferred (fleet)
│   └── node-api/              # deferred (fleet)
│
├── packages/
│   ├── contracts/             # OpenAPI / shared schemas
│   ├── eslint-config/
│   └── pr-review-agent/       # reusable GitHub PR review library
│
├── docs/
│   ├── architecture/
│   ├── adr/
│   └── milestones/
│
├── .github/
│
└── README.md
```

Directories should only be created when they are required. Empty applications or
placeholder packages should not be introduced unnecessarily.

`infrastructure/` and `scripts/` may be added when there is real content to put
in them. Today, local Postgres is configured via root `docker-compose.yml`.

---

## Application Boundaries

### Control Plane API

Owns centralized management and M1 orchestration:

- Webhook ingress (GitHub)
- Review run / findings persistence
- Node registration (early fleet building block)
- Operational metadata

Must not contain the reusable review algorithm (that belongs in
`packages/pr-review-agent`).

### Control Plane Web

Operator-facing UI. Talks only to the Control Plane API.

### review-agent (optional)

Thin deployable runner for this monorepo that imports `pr-review-agent`. Create
only when a separate process is needed; until then the library can be invoked
from tests or a future worker inside the Control Plane host.

### Node Agent / Node API (deferred)

Fleet lifecycle and local AI runtime. Not part of M1.

---

## Shared Packages

### `packages/pr-review-agent`

Installable Python library. Other repositories may depend on it.

**Must not** import Control Plane app code, Drizzle, NestJS, or this monorepo's
secrets handling.

### `packages/contracts`

OpenAPI source of truth for HTTP APIs shared across language boundaries.

### `packages/eslint-config`

Shared ESLint configuration for TypeScript apps.

Shared packages should exist only when at least two components (or an external
consumer) genuinely need them.

---

## Dependency Rules

1. Customer Node applications must not depend on Control Plane implementation code.
2. Control Plane applications must not depend on Customer Node implementation code.
3. Cross-system communication must happen through explicit interfaces or contracts.
4. `packages/pr-review-agent` must not depend on any `apps/*` package.
5. Apps may depend on `packages/contracts` and `packages/pr-review-agent`.
6. Shared packages must not bypass architectural boundaries.
7. Application business logic must not depend directly on infrastructure configuration.
8. Documentation must not become a runtime dependency.

---

## Technology Boundaries

```text
Control Plane
    └── TypeScript / NestJS / React

Reusable agents
    └── Python (uv) libraries such as pr-review-agent

Customer Node (deferred)
    └── Python AI/ML stack

Infrastructure
    └── Containers, networking, automation
```

---

## Monorepo Rationale

A monorepo is used because it simplifies local development, CI, documentation,
and cross-component changes while M1 is built.

`packages/pr-review-agent` is structured so it can be published or vendored into
other projects without dragging Control Plane deployment units along.

---

## Core Principle

> Components may share a repository, but they must not lose their architectural boundaries.
