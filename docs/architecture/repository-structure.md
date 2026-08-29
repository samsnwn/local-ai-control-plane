# Repository Structure and Technology Boundaries

## Overview

Local AI Control Plane will use a monorepo containing the different applications, infrastructure configuration, shared contracts, and project documentation.

The monorepo simplifies development and integration while keeping the Control Plane and Customer Node as separate architectural domains.

Being in the same repository does not mean that all components form a single application or deployment unit.

---

## Target Repository Structure

The repository should evolve toward the following structure:

```text
local-ai-control-plane/
├── apps/
│   ├── control-plane-api/
│   ├── control-plane-web/
│   ├── node-agent/
│   └── node-api/
│
├── packages/
│
├── infrastructure/
│
├── docs/
│   ├── architecture/
│   └── adr/
│
├── scripts/
│
├── .github/
│
└── README.md
```

This structure is a target architecture.

Directories should only be created when they are required. Empty applications or placeholder packages should not be introduced unnecessarily.

---

## Application Boundaries

### Control Plane API

The Control Plane API owns centralized management functionality.

Responsibilities include:

- Node registration.
- Node identity.
- Operational metadata.
- Node health state.
- Management operations.
- Control Plane persistence.

It must not contain Customer Node implementation logic.

---

### Control Plane Web

The Control Plane Web application provides the operator-facing interface.

It communicates with the Control Plane API.

It must not communicate directly with internal Customer Node services.

---

### Node Agent

The Node Agent is responsible for the operational lifecycle of a Customer Node.

Its responsibilities may include:

- Node registration.
- Heartbeats.
- Health reporting.
- Software and model version reporting.
- Receiving management commands.
- Applying local configuration changes.

The Node Agent should remain independent from the AI application layer.

---

### Node API

The Node API owns local AI functionality.

Its future responsibilities may include:

- Local model inference.
- Document processing.
- Embeddings.
- Retrieval-augmented generation.
- Local AI endpoints.

It must not contain fleet-management responsibilities.

---

## Shared Packages

The `packages/` directory is reserved for code or contracts that have multiple real consumers.

Potential examples include:

- API schemas.
- Shared protocol contracts.
- Generated clients.
- Common validation schemas.

Shared packages should not be introduced simply to avoid duplication.

They must also not become a mechanism for coupling Control Plane and Customer Node implementation details.

A shared package should generally exist only when at least two components genuinely depend on the same contract or behavior.

---

## Infrastructure

The `infrastructure/` directory owns configuration related to running or deploying the system.

Potential responsibilities include:

- Docker configuration.
- Docker Compose.
- Local development infrastructure.
- Networking configuration.
- Deployment configuration.
- Infrastructure-specific scripts.

Application business logic must not depend on infrastructure implementation details.

---

## Documentation

Project documentation lives under `docs/`.

Expected structure:

```text
docs/
├── project-scope.md
├── architecture/
│   ├── system-overview.md
│   └── repository-structure.md
└── adr/
```

Architecture Decision Records will be introduced separately.

---

## Scripts

The `scripts/` directory is reserved for repository-level automation.

Examples may include:

- Development setup.
- Repository validation.
- Local environment helpers.
- Deployment utilities.

Scripts should only be added when they automate repeatable project-level tasks.

---

## Dependency Rules

The repository follows these initial dependency rules:

1. Customer Node applications must not depend on Control Plane implementation code.

2. Control Plane applications must not depend on Customer Node implementation code.

3. Cross-system communication must happen through explicit interfaces or contracts.

4. Shared packages must not bypass architectural boundaries.

5. Application business logic must not depend directly on infrastructure configuration.

6. Documentation must not become a runtime dependency.

7. Shared code should only be introduced when there is a real need for reuse.

---

## Technology Boundaries

The repository must support multiple technology ecosystems.

The Control Plane and Customer Node have different requirements and should be free to use technologies appropriate to their domains.

Conceptually:

```text
Control Plane
    └── Web/backend ecosystem

Customer Node
    └── AI/ML ecosystem

Infrastructure
    └── Containers, networking and automation
```

The exact languages, frameworks, package managers, and runtimes are intentionally not defined here.

Those decisions will be made separately and documented through Architecture Decision Records.

---

## Monorepo Rationale

A monorepo is used for the MVP because it simplifies:

- Repository management.
- Local development.
- Documentation.
- CI.
- Cross-component changes.
- Integration testing.
- Version control.

The system should still preserve independent application and deployment boundaries.

If the project grows significantly, individual components may later be separated without changing the conceptual architecture.

---

## Core Principle

The repository structure should reflect the system architecture:

> Components may share a repository, but they must not lose their architectural boundaries.
