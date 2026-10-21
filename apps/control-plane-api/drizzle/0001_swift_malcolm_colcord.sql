CREATE INDEX "findings_review_run_id_idx" ON "findings" USING btree ("review_run_id");--> statement-breakpoint
CREATE INDEX "review_runs_node_id_idx" ON "review_runs" USING btree ("node_id");