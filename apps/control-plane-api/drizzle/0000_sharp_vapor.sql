CREATE TYPE "public"."finding_severity" AS ENUM('info', 'low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."node_status" AS ENUM('pending', 'active', 'inactive', 'unhealthy');--> statement-breakpoint
CREATE TYPE "public"."review_run_status" AS ENUM('running', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_run_id" uuid NOT NULL,
	"file" text NOT NULL,
	"line" integer,
	"severity" "finding_severity" NOT NULL,
	"confidence" real NOT NULL,
	"message" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identity" text NOT NULL,
	"status" "node_status" DEFAULT 'pending' NOT NULL,
	"last_heartbeat" timestamp with time zone,
	"software_version" text,
	"model_metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nodes_identity_unique" UNIQUE("identity")
);
--> statement-breakpoint
CREATE TABLE "review_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repo" text NOT NULL,
	"pr_number" integer NOT NULL,
	"status" "review_run_status" DEFAULT 'running' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"node_id" uuid
);
--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_review_run_id_review_runs_id_fk" FOREIGN KEY ("review_run_id") REFERENCES "public"."review_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_runs" ADD CONSTRAINT "review_runs_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;