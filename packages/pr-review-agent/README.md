# pr-review-agent

Reusable GitHub pull-request review library.

This package owns PR ingestion helpers, review pipeline interfaces, and structured
finding models. It is intended to be installable from other repositories.

## Boundary rules

- **Must not** import Control Plane application code (`apps/control-plane-api`, NestJS, Drizzle).
- **Must not** depend on this monorepo's database, mTLS, or operator auth.
- Control Plane integration (persist review runs, webhook orchestration) lives in
  `apps/control-plane-api` and talks to this library via CLI/subprocess, in-process
  calls, or HTTP adapters over `packages/contracts`.

## Local development

```bash
cd packages/pr-review-agent
uv sync
uv run pytest
uv run ruff check .
uv run ruff format --check .
```

## Package layout

```text
src/pr_review_agent/
  models/     # Finding, ReviewResult, and related types
  github/     # PR fetch / publish helpers (to be implemented)
  review/     # analysis pipeline (to be implemented)
```
