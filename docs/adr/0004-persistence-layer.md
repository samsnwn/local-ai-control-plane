# ADR-0004: Control Plane Persistence Layer

## Status

Proposed

## Context

The Control Plane needs persistent storage for operational metadata: node registration, heartbeats, health status, software/model versions, and (for M1) review runs and findings. PostgreSQL is already provisioned via `docker-compose.yml`, but `apps/control-plane-api` has no data layer — `AppModule` has `imports: []`.

M1 requires "basic review run persistence" and the Control Plane must store node metadata. Before implementing, we must select an ORM and design the initial schema.

## Considered Options

### Option A: Drizzle ORM (TypeScript)

**Advantages**

- TypeScript-first schema definition (no separate `.prisma` file; schema lives in `.ts` files).
- Generated, fully-typed client with excellent TypeScript inference.
- `drizzle-kit` for SQL migration generation and management.
- Lightweight runtime — thin layer over `pg`, no heavy runtime abstraction.
- Strong PostgreSQL support (JSONB, arrays, etc.) which fits `modelMetadata` and flexible node-reported data.
- Fits the Control Plane's TypeScript/NestJS stack (ADR-0001).
- Active development and growing NestJS/Node.js ecosystem.

**Disadvantages**

- Schema defined in TypeScript files rather than a declarative DSL (preference-dependent).
- Migration workflow requires `drizzle-kit` step separate from runtime.
- Smaller community than Prisma (though growing fast).

### Option B: Prisma

**Advantages**

- Declarative `schema.prisma` file as single source of truth.
- Built-in migration system (`prisma migrate dev`, `prisma migrate deploy`).
- Mature ecosystem and extensive documentation.

**Disadvantages**

- Heavier runtime abstraction over the database.
- Separate `.prisma` schema language to learn.
- Prisma client regeneration step (`prisma generate`) after schema changes.
- More opinionated project structure.

### Option C: TypeORM

**Advantages**

- Mature, widely used in NestJS projects (`@nestjs/typeorm` integration).
- Active Record and Data Mapper patterns supported.

**Disadvantages**

- Verbose entity decorators; less explicit than Drizzle/TypeScript schema.
- Migrations less straightforward than `drizzle-kit`.
- TypeScript support historically more fragile.

### Option D: Raw SQL / `pg` client

**Advantages**

- No ORM abstraction; full control over SQL.
- Zero additional dependencies beyond `pg`.

**Disadvantages**

- No type safety between SQL and TypeScript.
- Manual migration management.
- More boilerplate for CRUD operations; error-prone for an MVP.

## Decision

Use **Drizzle ORM** as the ORM for `apps/control-plane-api`.

Rationale:

- TypeScript-first schema keeps database definitions in the same language as the application code.
- Lightweight runtime over `pg` — minimal abstraction, easy to debug.
- `drizzle-kit` provides migration generation without the heaviness of Prisma's client regeneration cycle.
- Strong PostgreSQL JSONB support fits `modelMetadata` and flexible node-reported operational data.
- Aligns with the NestJS/TypeScript stack without introducing a separate schema language.

## Initial Schema

```ts
// apps/control-plane-api/src/modules/database/schema.ts

import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const nodeStatusEnum = pgEnum("node_status", [
  "pending",
  "active",
  "inactive",
  "unhealthy",
]);
export const reviewRunStatusEnum = pgEnum("review_run_status", [
  "running",
  "completed",
  "failed",
]);
export const findingSeverityEnum = pgEnum("finding_severity", [
  "info",
  "low",
  "medium",
  "high",
  "critical",
]);

export const nodes = pgTable("nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  identity: text("identity").notNull().unique(), // node identity (cert fingerprint or ID)
  status: nodeStatusEnum("status").notNull().default("pending"),
  lastHeartbeat: timestamp("last_heartbeat", { withTimezone: true }),
  softwareVersion: text("software_version"),
  modelMetadata: jsonb("model_metadata"), // flexible node-reported hardware/model info
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reviewRuns = pgTable("review_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  repo: text("repo").notNull(),
  prNumber: integer("pr_number").notNull(),
  status: reviewRunStatusEnum("status").notNull().default("running"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  nodeId: uuid("node_id").references(() => nodes.id),
});

export const findings = pgTable("findings", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewRunId: uuid("review_run_id")
    .notNull()
    .references(() => reviewRuns.id),
  file: text("file").notNull(),
  line: integer("line"),
  severity: findingSeverityEnum("severity").notNull(),
  confidence: real("confidence").notNull(), // 0.0 to 1.0
  message: text("message").notNull(),
});

export const nodesRelations = relations(nodes, ({ many }) => ({
  reviewRuns: many(reviewRuns),
}));

export const reviewRunsRelations = relations(reviewRuns, ({ one, many }) => ({
  node: one(nodes, { fields: [reviewRuns.nodeId], references: [nodes.id] }),
  findings: many(findings),
}));

export const findingsRelations = relations(findings, ({ one }) => ({
  reviewRun: one(reviewRuns, {
    fields: [findings.reviewRunId],
    references: [reviewRuns.id],
  }),
}));

export const schema = { nodes, reviewRuns, findings };
```

Tables: `nodes`, `review_runs`, `findings`.

## Migration Strategy

- Install `drizzle-orm`, `pg`, and `drizzle-kit` (devDependency) in `apps/control-plane-api`.
- Create `drizzle.config.ts` at workspace root or within `apps/control-plane-api/` pointing to the schema file.
- Local development: `drizzle-kit generate:pg` creates SQL migrations, then `drizzle-kit push` applies to local PostgreSQL (via Docker Compose).
- Migrations are version-controlled as SQL files in `apps/control-plane-api/drizzle/meta/` or similar.
- CI: run migrations against the CI PostgreSQL service container before tests.
- Production: migration strategy deferred to a future ADR when deployment platform is selected.

## Integration

- Create `DrizzleService` / database module in `apps/control-plane-api/src/modules/database/`.
- Initialize `drizzle(dbClient)` with `pg` Pool or `node-postgres` client.
- Export the typed Drizzle instance for use in repositories/services.
- Add database module to `AppModule` imports.
- `.env.example` updated with `DATABASE_URL` placeholder (e.g., `postgresql://user:pass@localhost:5432/db`).

## Consequences

### Positive

- Type-safe database access for operational metadata with full TypeScript inference.
- Schema defined in TypeScript — no separate schema language to learn.
- Lightweight runtime; easy to debug SQL queries directly.
- `drizzle-kit` migration SQL is transparent and reviewable.
- JSONB support for flexible node-reported metadata.

### Negative

- Additional dependencies (`drizzle-orm`, `pg`, `drizzle-kit`).
- Migration workflow requires a separate `drizzle-kit` step.
- Smaller community than Prisma (mitigated by active development).

### Implementation notes

- `DATABASE_URL` must point to local PostgreSQL (Docker Compose) in development.
- No customer AI data stored here — only operational metadata (ADR-0001 / system-overview.md).
- `pg` Pool should be configured with appropriate connection limits for local dev.
