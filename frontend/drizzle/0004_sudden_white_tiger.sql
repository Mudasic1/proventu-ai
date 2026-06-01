CREATE INDEX "contact_workspace_owner_idx" ON "contact" USING btree ("workspace_id","owner_user_id");--> statement-breakpoint
CREATE INDEX "deal_workspace_owner_idx" ON "deal" USING btree ("workspace_id","owner_user_id");--> statement-breakpoint
CREATE INDEX "follow_up_task_workspace_owner_idx" ON "follow_up_task" USING btree ("workspace_id","owner_user_id");