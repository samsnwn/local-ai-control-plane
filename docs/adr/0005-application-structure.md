# ADR-0005: Application Structure and Naming Convention

## Status

Accepted

## Context

The repository currently hosts two application directories:

- `apps/api/` — NestJS TypeScript stub for the Control Plane management API.
- `apps/web/` — Vite + React starter for the Control Plane management UI.

The target repository structure documented in `docs/architecture/repository-structure.md` specifies:

```
apps/
├── control-plane-api/
├── control-plane-web/
├── node-agent/
└── node-api/
```

The current names (`api`, `web`) do not distinguish between Control Plane and Customer Node domains. As the project grows to include Customer Node components (Node API in FastAPI/Python, Node Agent in Python), ambiguous names increase the risk of:

- Placing Customer Node code under a generic `apps/api/` that implies it belongs to the Control Plane.
- Turborepo filters, CI workflow paths, and documentation references becoming inaccurate or conflicting.
- Import path confusion between the two architectural domains.

The system architecture requires that Control Plane and Customer Node applications remain independent deployment units with explicit boundaries, even though they share a monorepo.

## Considered Options

### Option A: Rename to match target structure

Rename:

- `apps/api/` → `apps/control-plane-api/`
- `apps/web/` → `apps/control-plane-web/`

And reserve:

- `apps/node-agent/` — future Python Node Agent.
- `apps/node-api/` — future Python FastAPI Node API.

**Advantages**

- Directory names explicitly encode the architectural domain (Control Plane vs. Customer Node).
- Matches the target structure already documented in `docs/architecture/repository-structure.md`.
- Prevents accidental coupling by making it obvious which app owns which responsibility.
- Aligns Turborepo filters, CI paths, and developer commands with the domain model.

**Disadvantages**

- Requires renaming directories and updating all references (CI workflow, docs, README, Turbo config if app-specific).
- Git history for moved files is preserved but path-based blame/search may need adjustment.

### Option B: Keep current names (`apps/api/`, `apps/web/`)

**Advantages**

- No migration effort; zero changes to CI, docs, or imports.
- Minimal diff for the current M0 foundation.

**Disadvantages**

- Names are generic and do not indicate whether the app belongs to the Control Plane or Customer Node.
- Future Customer Node apps would need names like `apps/api-node/` or `apps/web-node/`, which are less clear and diverge from the documented target structure.
- Increases the risk of placing Customer Node implementation logic inside a directory that sounds Control Plane-specific.

## Decision

Adopt Option A. Rename `apps/api/` to `apps/control-plane-api/` and `apps/web/` to `apps/control-plane-web/`. Reserve `apps/node-agent/` and `apps/node-api/` for future Customer Node components.

## Consequences

### Positive

- Repository structure reflects the system architecture: components share a repository but keep their architectural boundaries visible in directory names.
- Future Customer Node apps have a predictable location (`apps/node-agent/`, `apps/node-api/`).
- Turborepo task filters and CI workflow paths become self-documenting.

### Negative

- Immediate migration cost: rename directories, update imports, CI workflow references, docs, and README examples.
- Existing branch names and open PRs referencing `apps/api/` or `apps/web/` will need rebasing or path updates.

### Migration steps

1. Create this ADR and get it approved via PR.
2. Rename directories: `git mv apps/api apps/control-plane-api` and `git mv apps/web apps/control-plane-web`.
3. Update `apps/control-plane-api/eslint.config.mjs` and `apps/control-plane-web/eslint.config.js` if they reference relative paths.
4. Update `.github/workflows/ci.yml` to reference new filter paths if any are hardcoded.
5. Update `README.md` and `docs/` references to `pnpm --filter api` / `pnpm --filter web` to the new filter names.
6. Run `pnpm install`, `pnpm run build`, `pnpm run lint`, `pnpm run typecheck`, and `pnpm run test` to verify nothing is broken.
7. Merge only after CI passes.
