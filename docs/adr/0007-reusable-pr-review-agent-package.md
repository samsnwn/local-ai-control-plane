# ADR-0007: Reusable PR Review Agent Package

## Status

Accepted

## Context

M1 delivers a GitHub PR review agent that must also be reusable in future
projects outside this monorepo. The previous Python layout
(`packages/python`, named `local-ai-control-plane-python`) was a tooling
workspace, not an installable library, and was branded as this product.

ADR-0005 reserved `apps/node-agent` / `apps/node-api` for fleet components. Those
are the wrong homes for a portable PR reviewer.

## Considered Options

### Option A: Implement review logic inside `apps/control-plane-api`

**Advantages:** Fastest for a single demo.

**Disadvantages:** Locked to NestJS/Drizzle; cannot be reused by other projects
without forking or extracting later under pressure.

### Option B: Generic `packages/python` workspace with mixed modules

**Advantages:** One uv project for all Python code.

**Disadvantages:** Product-named workspace; unclear packaging boundary; hard to
depend on from another repo as a library.

### Option C: Dedicated installable library `packages/pr-review-agent`

**Advantages:** Clear reuse boundary; generic package name; no Control Plane
imports; optional thin `apps/review-agent` runner later for this monorepo.

**Disadvantages:** Slightly more structure up front.

## Decision

Adopt **Option C**.

- Create `packages/pr-review-agent` as an installable Python package (`uv`).
- Keep Control Plane orchestration, webhooks, and persistence in
  `apps/control-plane-api`.
- Define HTTP shapes in `packages/contracts` (OpenAPI).
- Remove `packages/python` as the Python product home.
- Do **not** create empty `apps/review-agent` until a separate process is needed.

## Consequences

### Positive

- Other projects can depend on `pr-review-agent` without this Control Plane.
- Architectural boundary is visible in the tree and enforceable in review.
- M1 and fleet concerns stay separable.

### Negative

- Contributors must remember where logic belongs (library vs API).
- Cross-cutting changes may touch contracts + library + API in one PR.

### Implementation notes

- Package layout: `src/pr_review_agent/{models,github,review}/`.
- CI runs `uv sync --frozen`, pytest, and ruff from `packages/pr-review-agent`.
- Dependency rule: `packages/pr-review-agent` must not import any `apps/*` code.
