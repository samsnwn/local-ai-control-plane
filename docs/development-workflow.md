# Development Workflow

This document outlines the standard development workflow and conventions for the Local AI Control Plane repository. Following this structure ensures consistency, clean commit histories, and automated quality checks across both the TypeScript and Python workspaces.

---

## Process Overview

The lifecycle of any change follows a lightweight, structured flow optimized for solo or small-team development:

```
Milestone
   ↓
Issue
   ↓
Branch
   ↓
Implementation
   ↓
Pull Request
   ↓
CI (GitHub Actions)
   ↓
Review
   ↓
Merge to main
```

### 1. Milestones

Development is grouped into **Milestones** representing key capabilities or phases of the project (e.g., _Infrastructure Setup_, _Core API_, _Web UI Onboarding_). Milestones group related issues to track overall progress.

### 2. Issues

Every task, bug fix, or feature improvement should begin with a GitHub **Issue**. Issues:

- Define clear acceptance criteria.
- Identify dependencies on other issues where applicable.
- Act as the reference point for branches and pull requests.

---

## Conventions

### 1. Branch Naming

All branches must be created from `main` and named according to their purpose, referencing the related issue identifier:

| Type               | Pattern                        | Example                       |
| :----------------- | :----------------------------- | :---------------------------- |
| **Feature**        | `feat/<issue>-description`     | `feat/18-node-registration`   |
| **Bug Fix**        | `fix/<issue>-description`      | `fix/23-heartbeat-timeout`    |
| **Documentation**  | `docs/<issue>-description`     | `docs/42-update-architecture` |
| **Chore / Config** | `chore/<issue>-description`    | `chore/9-configure-ci`        |
| **Refactoring**    | `refactor/<issue>-description` | `refactor/14-auth-routing`    |

### 2. Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) to keep the git history semantic and readable:

```text
<type>(<scope>): <description>
```

- **`feat`**: A new feature (e.g., `feat(api): add node registration endpoint`)
- **`fix`**: A bug fix (e.g., `fix(web): handle missing heartbeat responses`)
- **`docs`**: Documentation updates (e.g., `docs: add development workflow guide`)
- **`chore`**: Maintenance, dependencies, tool configuration (e.g., `chore(ci): enable caching for uv step`)
- **`refactor`**: Code changes that neither fix bugs nor add features (e.g., `refactor(web): extract useAuth hooks`)

---

## Pull Requests & CI

### 1. Pull Requests

- **Scope**: Keep pull requests focused on a single issue or concern.
- **Reference**: Always link the related issue in the PR description (e.g., `Closes #18` or `Fixes #23`).
- **Template**: Fill out the repository PR template fully.

### 2. CI Expectations

On every pull request, the automated GitHub Actions pipeline runs checks to ensure compatibility:

- **Linting**: No ESLint (TypeScript) or Ruff (Python) warnings/errors.
- **Formatting**: Code style must match Prettier (TS/JS) and Ruff formatter (Python).
- **Type Checking**: TypeScript type checks must pass without errors (`pnpm typecheck`).
- **Unit Tests**: All Vitest (TS) and Pytest (Python) tests must pass.
- **Builds**: The workspace application builds must complete successfully (`pnpm build`).

> [!IMPORTANT]
> The PR should never be merged to `main` if any step in the CI pipeline fails.

---

## Definition of Done (DoD)

An issue is considered **Done** and ready to be closed when:

- [ ] All acceptance criteria defined in the issue are fully satisfied.
- [ ] Relevant unit and/or integration tests are added or updated to cover the change.
- [ ] Code formatting, linting, and type checking pass successfully locally.
- [ ] Relevant documentation (code comments, ADRs, user guides, workflow docs) is updated.
- [ ] The automated CI pipeline passes completely on the GitHub pull request.
- [ ] The pull request has been reviewed and approved.
- [ ] The branch is merged into `main`.
- [ ] The related issue is closed.
