CREATE TABLE "campaign_ai_request" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" text NOT NULL,
	"offer_id" text NOT NULL,
	"request_key" text NOT NULL,
	"ai_run_id" text,
	"goal" text NOT NULL,
	"target_audience" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"recommended_angle" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"safe_error_message" text,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_approval" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" text NOT NULL,
	"ai_request_id" text NOT NULL,
	"draft_type" text NOT NULL,
	"draft_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"risk_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reviewed_by_user_id" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_campaign" ADD COLUMN "generated_by_ai" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "email_campaign" ADD COLUMN "source_ai_run_id" text;--> statement-breakpoint
ALTER TABLE "social_post" ADD COLUMN "generated_by_ai" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "social_post" ADD COLUMN "source_ai_run_id" text;--> statement-breakpoint
ALTER TABLE "campaign_ai_request" ADD CONSTRAINT "campaign_ai_request_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_ai_request" ADD CONSTRAINT "campaign_ai_request_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_ai_request" ADD CONSTRAINT "campaign_ai_request_offer_id_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offer"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_ai_request" ADD CONSTRAINT "campaign_ai_request_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_approval" ADD CONSTRAINT "content_approval_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_approval" ADD CONSTRAINT "content_approval_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_approval" ADD CONSTRAINT "content_approval_ai_request_id_campaign_ai_request_id_fk" FOREIGN KEY ("ai_request_id") REFERENCES "public"."campaign_ai_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_approval" ADD CONSTRAINT "content_approval_reviewed_by_user_id_user_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_ai_request_workspace_key_idx" ON "campaign_ai_request" USING btree ("workspace_id","request_key");--> statement-breakpoint
CREATE INDEX "campaign_ai_request_campaign_idx" ON "campaign_ai_request" USING btree ("workspace_id","campaign_id","created_at");--> statement-breakpoint
CREATE INDEX "content_approval_workspace_status_idx" ON "content_approval" USING btree ("workspace_id","status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "content_approval_draft_idx" ON "content_approval" USING btree ("draft_type","draft_id");