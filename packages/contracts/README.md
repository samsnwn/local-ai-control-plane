# @repo/contracts

Language-agnostic API contracts for the Control Plane.

## Source of truth

`openapi/openapi.yaml` defines the HTTP shapes for the Control Plane API.

## Rules

- Spec changes are reviewed in PRs before or with implementation.
- Control Plane apps may depend on this package.
- This package must not contain application logic.
- Keep the spec limited to endpoints that have (or are about to have) a real consumer.

## Near-term (M1)

Documented operations for the Control Plane management API:

- `POST /nodes/register`
- `GET /nodes`
