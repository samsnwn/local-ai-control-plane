import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  real,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const nodeStatusEnum = pgEnum('node_status', [
  'pending',
  'active',
  'inactive',
  'unhealthy',
]);
export const reviewRunStatusEnum = pgEnum('review_run_status', [
  'running',
  'completed',
  'failed',
]);
export const findingSeverityEnum = pgEnum('finding_severity', [
  'info',
  'low',
  'medium',
  'high',
  'critical',
]);

export const nodes = pgTable('nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  identity: text('identity').notNull().unique(),
  status: nodeStatusEnum('status').notNull().default('pending'),
  lastHeartbeat: timestamp('last_heartbeat', { withTimezone: true }),
  softwareVersion: text('software_version'),
  modelMetadata: jsonb('model_metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reviewRuns = pgTable(
  'review_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    repo: text('repo').notNull(),
    prNumber: integer('pr_number').notNull(),
    status: reviewRunStatusEnum('status').notNull().default('running'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    nodeId: uuid('node_id').references(() => nodes.id),
  },
  (table) => [index('review_runs_node_id_idx').on(table.nodeId)],
);

export const findings = pgTable(
  'findings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reviewRunId: uuid('review_run_id')
      .notNull()
      .references(() => reviewRuns.id),
    file: text('file').notNull(),
    line: integer('line'),
    severity: findingSeverityEnum('severity').notNull(),
    confidence: real('confidence').notNull(),
    message: text('message').notNull(),
  },
  (table) => [index('findings_review_run_id_idx').on(table.reviewRunId)],
);

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
