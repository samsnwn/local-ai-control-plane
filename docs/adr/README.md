# Architecture Decision Records

## Purpose

Architecture Decision Records (ADRs) are used to document significant technical and architectural decisions made during the project.

The goal is to preserve not only what was chosen, but also why the decision was made and which alternatives were considered.

ADRs should remain concise and practical.

---

## Location

All ADRs are stored under:

```text
docs/adr/
```

---

## Naming Convention

ADRs use sequential four-digit identifiers.

Example:

```text
0001-initial-technology-stack.md
0002-node-communication-protocol.md
0003-networking-strategy.md
```

Numbers must not be reused.

If an ADR is replaced by a newer decision, the original file remains in the repository for historical context.

---

## Status

An ADR may have one of the following statuses:

- `Proposed` — the decision is still under consideration.
- `Accepted` — the decision is currently part of the project architecture.
- `Superseded` — a newer ADR replaces this decision.
- `Deprecated` — the decision is no longer recommended or relevant.

A superseded ADR should reference the ADR that replaces it.

---

## When to Create an ADR

Create an ADR when a decision:

- Affects multiple components.
- Introduces important infrastructure.
- Establishes a long-term technology choice.
- Has meaningful security implications.
- Would be expensive or difficult to reverse.

Examples include:

- Control Plane technology stack.
- Customer Node technology stack.
- Database selection.
- Local AI runtime.
- Node communication protocol.
- Networking strategy.
- Authentication strategy.
- Deployment strategy.

Routine implementation decisions do not require an ADR.

---

## Workflow

A typical architectural decision should follow this flow:

```text
Requirement
    ↓
Architectural question
    ↓
ADR created
    ↓
Options evaluated
    ↓
Decision accepted
    ↓
Implementation
```

ADRs should normally be reviewed through the same pull request workflow as other project changes.

---

## Template

New ADRs should be based on:

```text
docs/adr/template.md
```
