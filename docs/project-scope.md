# Project Scope

## Overview

Local AI Control Plane is a platform for deploying, operating, and managing
private AI workloads and agents.

The long-term vision is a **private AI fleet manager**: customer-owned nodes run
LLMs/RAG/data locally; a central control plane manages registration, health,
versions, and ops metadata without holding customer AI data.

The **near-term product (M1)** is narrower and ships first:

> A self-hosted GitHub pull-request review agent, orchestrated by the Control
> Plane, with review logic packaged so other projects can reuse it.

---

## Problem

Organizations want generative AI on internal data and workflows without giving
up privacy, sovereignty, or operational control.

Cloud AI providers introduce concerns around data privacy, vendor dependency,
and connectivity. Running AI locally helps, but operating many installations
(or many agents) becomes complex.

This project explores a central management plane for those workloads while
keeping sensitive data and reusable agent capabilities cleanly separated.

---

## Near-term goal (M1)

Demonstrate a complete GitHub PR review vertical slice:

1. GitHub webhook (or manual trigger) starts a review.
2. `packages/pr-review-agent` analyzes the PR and produces structured findings.
3. The Control Plane persists review runs and findings.
4. Findings can be published back to the pull request.

M1 success does **not** require a fleet of customer nodes or a local LLM on
each node.

---

## Longer-term goal (post-M1)

Demonstrate that a central management platform can manage multiple independently
running local AI nodes:

1. **Customer Node** — runs AI workloads and stores customer data.
2. **Control Plane** — manages infrastructure metadata, configuration, health,
   and lifecycle operations across nodes.

See `docs/architecture/system-overview.md` for the fleet architecture.

---

## Customer Node (deferred)

A customer node represents an independent AI installation on customer-controlled
infrastructure. Eventually it should:

- Run a local LLM and expose local AI APIs.
- Process documents locally (including RAG).
- Persist customer-specific data locally.
- Report health and versions to the Control Plane.
- Receive authorized management operations.

Each node remains an independent security and data boundary.

---

## Control Plane

Near-term responsibilities (M1):

- GitHub integration and webhook verification.
- Review run / findings persistence.
- Invoking or hosting the PR review agent workflow.
- Shared OpenAPI contracts for agent-facing APIs.

Longer-term responsibilities (fleet):

- Registering and identifying nodes securely.
- Tracking availability, health, software versions, and models.
- Sending authorized management operations.
- Providing a web interface for infrastructure management.

The control plane manages infrastructure and operational metadata, not the
customer's AI business data.

---

## Reusable agent library

`packages/pr-review-agent` is a first-class deliverable, not an internal detail.

It must remain installable and free of Control Plane implementation dependencies
so other repositories can reuse the review capability.

---

## Data Ownership and Isolation

Customer-specific AI data should remain inside the corresponding customer node
(when fleet features exist). That includes documents, embeddings, prompts,
conversations, and business data.

The control plane may store operational metadata, including node identifiers,
status, versions, heartbeats, deployment configuration, and (for M1) review
runs and findings derived from GitHub PRs the operator has authorized.

Compromise of one customer node must not automatically grant access to another.

---

## Non-Goals (current phase)

- Billing and subscriptions
- Kubernetes orchestration
- Mobile applications
- Enterprise SSO (beyond planned GitHub OAuth for operators)
- Hardware manufacturing
- Cloud-hosted LLM inference as the primary product
- Multi-region HA / automatic horizontal scaling
- Full enterprise compliance certification
- Shipping fleet node apps before M1 is demonstrable

---

## Engineering Principles

### Spec-driven

Cross-boundary HTTP APIs are defined in `packages/contracts` (OpenAPI) and
implemented against that contract.

### Local-first (fleet)

Customer AI workloads and business data remain on customer-controlled
infrastructure whenever possible.

### Isolation

Each customer node is an independent security and data boundary. The reusable
agent library is isolated from Control Plane deployment code.

### Reproducibility

Dependencies are locked (`pnpm-lock.yaml`, `uv.lock`). Environments are
reproducible via Docker Compose for Postgres.

### Observability

The system should expose enough operational information to know whether a review
run (and later a node) is healthy.

### Security by design

Authentication, authorization, and network boundaries are part of the
architecture. M1 requires webhook HMAC verification and authenticated agent
callbacks; fleet mTLS remains for node surfaces (ADR-0002 / ADR-0003).

### Incremental development

Build small, testable milestones. Introduce infrastructure complexity only when
justified by an actual requirement.

---

## Future Direction

Beyond M1 and the initial fleet MVP, the architecture could evolve toward:

- Automated node provisioning and remote updates
- Model deployment and version management
- Policy management, RBAC, and audit logging
- Additional reusable local AI applications and agents

These possibilities may influence architecture, but must not inflate M1 scope.
