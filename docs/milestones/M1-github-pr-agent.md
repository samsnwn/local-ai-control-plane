# M1 — GitHub PR Review Agent

## Objective

Build the first functional AI agent for the Local AI Control Plane capable of reviewing GitHub Pull Requests and producing actionable code-review findings.

M1 is the first product milestone after the M0 foundation.

The primary goal is to validate the core agent capability before expanding the project into a full Control Plane.

## Goal

Given a GitHub Pull Request, the system should be able to:

1. Detect or receive the Pull Request.
2. Retrieve the Pull Request metadata and changes.
3. Retrieve the repository context required to understand those changes.
4. Analyze the changes using an AI review agent.
5. Produce structured review findings.
6. Publish the findings back to the GitHub Pull Request.

The result should provide a lightweight, self-hosted AI-powered GitHub code reviewer.

## High-Level Architecture

```text
GitHub Pull Request
        │
        ▼
GitHub Integration
        │
        ▼
PR Ingestion
        │
        ├── Metadata
        ├── Diff
        └── Repository Context
        │
        ▼
Review Agent
        │
        ▼
Structured Findings
        │
        ▼
GitHub Review
```

The implementation should remain modular so that the review agent can later be orchestrated by the Control Plane.

## Scope

M1 will establish the first complete GitHub PR review workflow:

- GitHub integration and authentication.
- Pull Request ingestion.
- Pull Request metadata and diff retrieval.
- Repository context retrieval.
- AI-powered code review.
- Structured review findings.
- Finding severity and confidence.
- GitHub review/comment publishing.
- Basic review run persistence.
- End-to-end testing.
- Initial agent evaluation.

## Definition of Done

M1 is complete when:

- A GitHub Pull Request can trigger or start a review.
- The system can retrieve the Pull Request diff.
- Relevant repository context can be provided to the agent.
- The AI agent produces structured findings.
- Findings include severity and confidence.
- Review runs and findings can be persisted.
- Findings can be published back to GitHub.
- A complete review works end-to-end.
- Pull Requests with no findings are handled correctly.
- Core failure cases are handled safely.
- Automated tests cover the core review pipeline.
- Agent quality can be evaluated using a reproducible test set.

## Out of Scope

The following are intentionally deferred:

- Full Control Plane orchestration.
- Multi-agent orchestration.
- Customer node management.
- Remote node execution.
- Distributed scheduling.
- VPN or remote networking.
- Kubernetes.
- Production deployment.
- Automatic code modification.
- Automatic PR merging.
- Autonomous repository code execution.
- Advanced multi-model routing.
- Production-grade observability.

## M1 Outcome

At the end of M1, the project should have a demonstrable product capability:

> Given a GitHub Pull Request, the Local AI Control Plane can run an AI code-review agent, identify actionable issues, and publish those findings back to the Pull Request.

This vertical slice will serve as the foundation for the next milestone, where the system can evolve from a single useful agent into a general Control Plane capable of managing and orchestrating agents.