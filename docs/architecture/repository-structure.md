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

**M1** delivers the Control Plane management API:

- Management API endpoints and routing live in `apps/control-plane-api`.
- Cross-language HTTP shapes live in `packages/contracts`.

Fleet/node apps are documented as future targets only.

---

## Target Repository Structure

```text
local-ai-control-plane/
├── apps/
│   ├── control-plane-api/
│   ├── control-plane-web/
│   ├── node-agent/            # deferred (fleet)
│   └── node-api/              # deferred (fleet)
│
    ├── packages/
    │   ├── contracts/             # OpenAPI / shared schemas
    │   └── eslint-config/
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

Owns centralized management:

- Management API endpoints and routing
- Node registration (early fleet building block)
- Operational metadata

Must not embed external service implementation code.

### Control Plane Web

Operator-facing UI. Talks only to the Control Plane API.

### Node Agent / Node API (deferred)

Fleet lifecycle and local AI runtime. Not part of M1.

---

## Shared Packages

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
4. Apps may depend on `packages/contracts`.
6. Shared packages must not bypass architectural boundaries.
7. Application business logic must not depend directly on infrastructure configuration.
8. Documentation must not become a runtime dependency.

---

## Technology Boundaries

```text
Control Plane
    └── TypeScript / NestJS / React

Reusable agents

Customer Node (deferred)
    └── Python AI/ML stack

Infrastructure
    └── Containers, networking, automation
```

---

## Monorepo Rationale

The monorepo is used because it simplifies local development, CI, documentation,
and cross-component changes while M1 is built.

---

## Core Principle

> Components may share a repository, but they must not lose their architectural boundaries.
