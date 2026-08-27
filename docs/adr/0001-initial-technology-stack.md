# ADR-0001: Initial Technology Stack

## Status

Accepted

## Context

The project requires a technology stack for two different environments:

- A centralized Control Plane used to manage customer nodes.
- A Customer Node running local AI workloads on customer-controlled infrastructure.

The stack should prioritize maintainability, simplicity, ecosystem maturity, and compatibility with future AI requirements.

The architecture intentionally allows different technologies to be used by the Control Plane and Customer Node.

---

## Decision Drivers

- Maintainability.
- Developer experience.
- Ecosystem maturity.
- AI/ML ecosystem compatibility.
- Type safety where appropriate.
- Testing support.
- Docker compatibility.
- Suitability for a small MVP.
- Ability to evolve without unnecessary complexity.

---

## Considered Options

### Control Plane API

#### NestJS + TypeScript

**Advantages**

- Strong TypeScript support.
- Clear application architecture.
- Good support for modular backend systems.
- Suitable for a management platform that may grow over time.
- Familiar ecosystem for the project.

**Disadvantages**

- More opinionated than a minimal Node.js framework.
- Introduces more structure than a very small API may require.

#### FastAPI + Python

**Advantages**

- Excellent Python ecosystem.
- Simple API development.
- Strong typing through Python type hints.
- Natural fit with AI/ML services.

**Disadvantages**

- Would introduce Python into the central management layer without a strong requirement.
- The Control Plane does not need to be tightly coupled to the AI/ML ecosystem.

### Decision

Use **NestJS with TypeScript** for the Control Plane API.

---

### Control Plane Web

#### React + Vite + TypeScript

**Advantages**

- Mature ecosystem.
- Strong TypeScript support.
- Well suited to an operator dashboard.
- Clear separation from the backend API.
- Fast local development.

**Disadvantages**

- Requires a separate frontend application and build pipeline.

### Decision

Use **React, Vite, and TypeScript** for the Control Plane Web application.

---

### Customer Node API

#### FastAPI + Python

**Advantages**

- Strong fit for AI/ML workloads.
- Excellent Python ecosystem.
- Simple API development.
- Good support for asynchronous workloads.
- Easy integration with future AI libraries.

**Disadvantages**

- Introduces a second language ecosystem.
- Requires independent dependency and tooling management.

### Decision

Use **FastAPI with Python** for the Customer Node API.

---

### Node Agent

The Node Agent will run inside the Customer Node environment and interact with local AI and system-level services.

Python provides a strong ecosystem for:

- AI/ML tooling.
- System interaction.
- HTTP clients.
- Process management.
- Local automation.

### Decision

Use **Python** for the Node Agent.

The Agent and Node API will remain separate components even though they use the same language.

---

### Database

#### PostgreSQL

**Advantages**

- Mature and widely adopted.
- Strong relational model.
- Excellent Docker support.
- Well suited to structured operational metadata.
- Suitable for the Control Plane MVP.
- Large ecosystem.

**Disadvantages**

- Requires database infrastructure.
- Provides more functionality than an extremely small MVP may require.

### Decision

Use **PostgreSQL** for Control Plane persistence.

Customer-specific AI data storage will be evaluated separately when required.

---

## Monorepo and Dependency Management

The project will use a monorepo to manage the different components of the system.

### Turborepo

**Turborepo** will be used to orchestrate tasks across the monorepo.

It will provide:

- Task orchestration.
- Build coordination.
- Test coordination.
- Linting coordination.
- Task caching where appropriate.
- Consistent repository-wide development commands.

### TypeScript

Use **pnpm** as the package manager for JavaScript/TypeScript applications and packages.

Turborepo will operate on top of the pnpm workspace.

### Python

Python applications will maintain their own dependency environments and tooling.

They will not be forced into the JavaScript package management system.

This preserves the language boundaries established in the system architecture.

### Decision

Use:

- **Turborepo** for monorepo task orchestration.
- **pnpm** for TypeScript/JavaScript dependency management.
- Independent Python dependency management for Python applications.

---

## Final Stack

The initial MVP stack is:

| Component | Technology |
|---|---|
| Control Plane API | NestJS + TypeScript |
| Control Plane Web | React + Vite + TypeScript |
| Customer Node API | FastAPI + Python |
| Node Agent | Python |
| Control Plane Database | PostgreSQL |
| Monorepo orchestration | Turborepo |
| TypeScript package management | pnpm |
| Infrastructure | Docker / Docker Compose |

---

## Deferred Decisions

The following decisions are intentionally not made by this ADR:

- Local AI runtime.
- LLM model selection.
- Vector database.
- Node ↔ Control Plane communication protocol.
- Networking/VPN solution.
- Authentication architecture.
- Production deployment platform.
- Observability stack.

These decisions will be evaluated when their corresponding requirements are introduced.

---

## Consequences

### Positive

- Clear separation between the management platform and AI environment.
- TypeScript provides a consistent Control Plane ecosystem.
- Python provides direct access to the AI/ML ecosystem.
- PostgreSQL provides a reliable foundation for operational metadata.
- Turborepo provides consistent task orchestration across the monorepo.
- The stack remains relatively simple for the MVP.
- Components can evolve independently.
- Future AI infrastructure can be selected without being coupled to the initial stack.

### Negative

- The repository contains multiple language ecosystems.
- TypeScript and Python require separate dependency management.
- CI must validate both ecosystems.
- Developers need basic familiarity with both environments.
- Turborepo and pnpm introduce additional tooling to the repository.

These trade-offs are accepted because the separation aligns with the system architecture and keeps each component close to the ecosystem best suited to its responsibilities.