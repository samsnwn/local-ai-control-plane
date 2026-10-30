# ADR-0006: Shared Contracts & API Schema Strategy

## Status

Proposed

## Context

ADR-0001 establishes TypeScript (Control Plane API + Web) as the primary ecosystem. `packages/eslint-config` is the only shared package today, and it contains no API contracts.

M1 delivers the Control Plane management API. The contracts package is the source of truth for Control Plane API shapes.

## Considered Options

### Option A: OpenAPI 3.0 / JSON Schema (language-agnostic)

**Advantages**

- Language-agnostic: both TypeScript and Python can consume the same spec.
- Can generate TypeScript types and Python Pydantic models from the same spec.
- Mature tooling (OpenAPI Generator, swagger-ui, openapi-typescript).
- Human-readable YAML/JSON; easy to review in PRs.
- NestJS has decorators (`@nestjs/swagger`) that can generate OpenAPI from controllers.

**Disadvantages**

- Requires a code generation step in CI or local dev.
- Two ecosystems must agree on when to regenerate.
- NestJS decorators can drift from the actual schema if not carefully maintained.

### Option B: TypeScript interfaces + manual Pydantic models

**Advantages**

- No code generation step.
- Simple for small schemas.

**Disadvantages**

- Duplication: TypeScript interfaces and Pydantic models must be kept in sync manually.
- High drift risk as schemas evolve.
- No single source of truth.

### Option C: Protobuf / gRPC

**Advantages**

- Strong typing and code generation for both languages.
- Efficient binary serialization.

**Disadvantages**

- Overkill for an MVP management API (HTTP/JSON is simpler).
- Requires Protobuf toolchain in both ecosystems.
- Not browser-friendly for the Control Plane Web app.

### Option D: Shared TypeScript package consumed by Python via JSON

**Advantages**

- Single source of truth in TypeScript.

**Disadvantages**

- Python cannot consume TypeScript types directly.
- Would require exporting JSON schema from TS and importing into Python — adds complexity for little benefit.

## Decision

Use **OpenAPI 3.0 / JSON Schema** as the shared contract format, stored in `packages/contracts/`.

Rationale:

- Language-agnostic, enabling any future consumer without coupling to implementation code.
- Single source of truth for request/response shapes.
- NestJS (`@nestjs/swagger`) can generate or validate OpenAPI from controllers.
- Human-reviewable YAML files in PRs.

## Location

`packages/contracts/`

```
packages/contracts/
  src/
    openapi.yaml          # shared API contract (OpenAPI 3.0)
  package.json
```

## What goes in `packages/contracts/`

- OpenAPI spec for Control Plane API endpoints:
  - `POST /nodes/register`
  - `GET /nodes`
- JSON schemas for request bodies and response bodies.

## What does NOT go in `packages/contracts/`

- Control Plane implementation logic (services, controllers, NestJS modules).
- Customer Node implementation logic (FastAPI routes, Python agent code).
- Internal types not shared across the language boundary.

## Code generation

- TypeScript: `openapi-typescript` generates TS types from `openapi.yaml`.
- Generation step runs in CI or as part of `turbo build` when contracts change.
- Generated files are NOT committed; they are generated at build time.

## Dependency rules (enforced)

- Control Plane apps must not import Customer Node implementation code.
- Customer Node apps must not import Control Plane implementation code.
- Both may import from `packages/contracts/` (shared schema only).
- `packages/contracts/` must not depend on any app.

## Consequences

### Positive

- Single source of truth for cross-ecosystem API contracts.
- Prevents drift between TypeScript and Python request/response shapes.
- Enforces architectural boundaries: apps share contracts, not implementation.
- OpenAPI spec is human-reviewable in PRs.

### Negative

- Additional package to maintain (`packages/contracts/`).
- Code generation step adds CI/local dev complexity.
- Schema changes require coordination across both ecosystems.

### Implementation notes

- `packages/contracts/package.json` should be a plain JSON schema package (no runtime code).
- Install `@nestjs/swagger` in `apps/control-plane-api` to generate/validate OpenAPI from controllers.
- The OpenAPI spec should be versioned (e.g., `openapi.yaml` with `info.version`).
