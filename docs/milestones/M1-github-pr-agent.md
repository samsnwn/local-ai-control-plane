# M1 — GitHub PR Review Agent

## Objective

Build a functional GitHub PR review capability that is:

1. **Reusable** — core logic lives in `packages/pr-review-agent` and can be used
   by other projects without this Control Plane.
2. **Orchestrated** — this monorepo's Control Plane receives GitHub events,
   persists review runs/findings, and coordinates publishing.

M1 is the first product milestone after the M0 foundation (monorepo, CI,
Postgres, early mTLS node registration).

## Goal

Given a GitHub Pull Request, the system should:

1. Detect or receive the Pull Request (webhook or manual trigger).
2. Retrieve Pull Request metadata and changes.
3. Retrieve repository context required to understand those changes.
4. Analyze the changes using the review agent library.
5. Produce structured review findings.
6. Persist the review run and findings via the Control Plane API.
7. Publish the findings back to the GitHub Pull Request.

## Component map

```text
GitHub Pull Request
        │
        ▼
apps/control-plane-api          # webhook HMAC, orchestration, persistence
        │
        ├── packages/contracts  # OpenAPI: review-runs, webhooks
        │
        ▼
packages/pr-review-agent        # reusable library (no CP imports)
        │
        ├── github/             # fetch / publish helpers
        ├── review/             # analysis pipeline
        └── models/             # Finding, ReviewResult
        │
        ▼
Structured Findings → Control Plane API → GitHub Review
```

## Scope

- GitHub App integration and webhook signature verification.
- Pull Request ingestion (metadata, diff, context).
- AI-powered code review inside `packages/pr-review-agent`.
- Structured findings (severity + confidence).
- Review run persistence (`review_runs`, `findings` tables already exist).
- APIs aligned to `packages/contracts/openapi/openapi.yaml`.
- Authenticated agent callbacks (`INTERNAL_API_TOKEN` / Bearer).
- End-to-end tests and an initial evaluation set.

## Security requirements (M1)

- `POST /webhooks/github` is public but must verify `x-hub-signature-256`.
- Review-run APIs require an internal service credential.
- Do not place public webhook or browser routes behind node client-cert mTLS
  (split listeners or equivalent — ADR-0003).
- `packages/pr-review-agent` must not hold Control Plane secrets or DB access.

## Definition of Done

- A GitHub Pull Request can trigger or start a review.
- The system can retrieve the Pull Request diff and relevant context.
- The agent produces structured findings with severity and confidence.
- Review runs and findings are persisted.
- Findings can be published back to GitHub.
- Empty-finding and core failure cases are handled safely.
- Automated tests cover the core review pipeline.
- Agent quality can be evaluated with a reproducible test set.

## Out of Scope

- Full fleet / customer node management
- Remote node execution of reviews
- Multi-agent orchestration
- VPN / Kubernetes / production deployment
- Automatic code modification or PR merging
- Advanced multi-model routing
- Production-grade observability

## M1 Outcome

> Given a GitHub Pull Request, the Local AI Control Plane can run an AI
> code-review agent (from `packages/pr-review-agent`), identify actionable
> issues, persist them, and publish findings back to the Pull Request.

The next milestone can evolve this into broader Control Plane orchestration and
eventually customer-node fleet management.
