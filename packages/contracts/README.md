# @repo/contracts

Language-agnostic API contracts for the Control Plane.

## Source of truth

`openapi/openapi.yaml` defines the HTTP shapes shared across language boundaries
(NestJS Control Plane API ↔ Python agent hosts).

## Rules

- Spec changes are reviewed in PRs before or with implementation.
- Control Plane apps and agent hosts may depend on this package.
- This package must not contain application logic.
- Keep the spec limited to endpoints that have (or are about to have) a real consumer.

## Near-term (M1)

Documented operations for the GitHub PR review vertical slice:

- `POST /webhooks/github`
- `POST /review-runs`
- `GET /review-runs/{id}`
- `POST /review-runs/{id}/findings`
