CREATE TABLE "billing_purchase" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"kind" text NOT NULL,
	"billing_plan_id" text,
	"top_up_package_id" text,
	"requested_by_user_id" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"stripe_checkout_session_id" text,
	"stripe_payment_intent_id" text,
	"stripe_subscription_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"fulfilled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_grant" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"wallet_id" text NOT NULL,
	"source_kind" text NOT NULL,
	"source_id" text NOT NULL,
	"operation_key" text NOT NULL,
	"granted_credits" integer NOT NULL,
	"available_credits" integer NOT NULL,
	"reserved_credits" integer DEFAULT 0 NOT NULL,
	"consumed_credits" integer DEFAULT 0 NOT NULL,
	"reversed_credits" integer DEFAULT 0 NOT NULL,
	"expired_credits" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_ledger_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"wallet_id" text NOT NULL,
	"entry_type" text NOT NULL,
	"operation_key" text NOT NULL,
	"spendable_delta" integer DEFAULT 0 NOT NULL,
	"reserved_delta" integer DEFAULT 0 NOT NULL,
	"unresolved_delta" integer DEFAULT 0 NOT NULL,
	"spendable_after" integer NOT NULL,
	"reserved_after" integer NOT NULL,
	"unresolved_after" integer NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"actor_user_id" text,
	"reason" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_wallet" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"spendable_credits" integer DEFAULT 0 NOT NULL,
	"reserved_credits" integer DEFAULT 0 NOT NULL,
	"unresolved_credits" integer DEFAULT 0 NOT NULL,
	"spending_blocked" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operations_audit_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text,
	"actor_user_id" text,
	"actor_kind" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"safe_summary" text DEFAULT '' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_record" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"billing_purchase_id" text,
	"workspace_subscription_id" text,
	"kind" text NOT NULL,
	"stripe_object_id" text NOT NULL,
	"status" text NOT NULL,
	"amount_minor" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"safe_summary" text DEFAULT '' NOT NULL,
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_account" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"platform" text NOT NULL,
	"account_name" text NOT NULL,
	"account_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_webhook_event" (
	"id" text PRIMARY KEY NOT NULL,
	"stripe_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"stripe_object_id" text NOT NULL,
	"workspace_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp DEFAULT now() NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"safe_error_code" text,
	"safe_error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "top_up_package" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"stripe_price_id" text NOT NULL,
	"granted_credits" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp DEFAULT now() NOT NULL,
	"effective_to" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_billing_account" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"billing_email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "billing_plan" ADD COLUMN "stripe_price_id" text;--> statement-breakpoint
ALTER TABLE "billing_plan" ADD COLUMN "monthly_included_credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "billing_plan" ADD COLUMN "effective_from" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "billing_plan" ADD COLUMN "effective_to" timestamp;--> statement-breakpoint
ALTER TABLE "workspace_subscription" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "workspace_subscription" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "workspace_subscription" ADD COLUMN "current_period_start" timestamp;--> statement-breakpoint
ALTER TABLE "workspace_subscription" ADD COLUMN "current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "workspace_subscription" ADD COLUMN "cancel_at_period_end" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_subscription" ADD COLUMN "ended_at" timestamp;--> statement-breakpoint
ALTER TABLE "billing_purchase" ADD CONSTRAINT "billing_purchase_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_purchase" ADD CONSTRAINT "billing_purchase_billing_plan_id_billing_plan_id_fk" FOREIGN KEY ("billing_plan_id") REFERENCES "public"."billing_plan"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_purchase" ADD CONSTRAINT "billing_purchase_top_up_package_id_top_up_package_id_fk" FOREIGN KEY ("top_up_package_id") REFERENCES "public"."top_up_package"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_purchase" ADD CONSTRAINT "billing_purchase_requested_by_user_id_user_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_grant" ADD CONSTRAINT "credit_grant_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_grant" ADD CONSTRAINT "credit_grant_wallet_id_credit_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."credit_wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger_entry" ADD CONSTRAINT "credit_ledger_entry_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger_entry" ADD CONSTRAINT "credit_ledger_entry_wallet_id_credit_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."credit_wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_ledger_entry" ADD CONSTRAINT "credit_ledger_entry_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_wallet" ADD CONSTRAINT "credit_wallet_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations_audit_entry" ADD CONSTRAINT "operations_audit_entry_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations_audit_entry" ADD CONSTRAINT "operations_audit_entry_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_record" ADD CONSTRAINT "payment_record_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_record" ADD CONSTRAINT "payment_record_billing_purchase_id_billing_purchase_id_fk" FOREIGN KEY ("billing_purchase_id") REFERENCES "public"."billing_purchase"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_record" ADD CONSTRAINT "payment_record_workspace_subscription_id_workspace_subscription_id_fk" FOREIGN KEY ("workspace_subscription_id") REFERENCES "public"."workspace_subscription"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_account" ADD CONSTRAINT "social_account_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_webhook_event" ADD CONSTRAINT "stripe_webhook_event_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_billing_account" ADD CONSTRAINT "workspace_billing_account_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "billing_purchase_workspace_key_idx" ON "billing_purchase" USING btree ("workspace_id","idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_purchase_checkout_session_idx" ON "billing_purchase" USING btree ("stripe_checkout_session_id");--> statement-breakpoint
CREATE INDEX "billing_purchase_workspace_idx" ON "billing_purchase" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_grant_operation_key_idx" ON "credit_grant" USING btree ("operation_key");--> statement-breakpoint
CREATE INDEX "credit_grant_workspace_expiry_idx" ON "credit_grant" USING btree ("workspace_id","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_ledger_entry_operation_key_idx" ON "credit_ledger_entry" USING btree ("operation_key");--> statement-breakpoint
CREATE INDEX "credit_ledger_entry_workspace_idx" ON "credit_ledger_entry" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_wallet_workspace_idx" ON "credit_wallet" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "operations_audit_workspace_idx" ON "operations_audit_entry" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_record_stripe_object_idx" ON "payment_record" USING btree ("stripe_object_id");--> statement-breakpoint
CREATE INDEX "payment_record_workspace_idx" ON "payment_record" USING btree ("workspace_id","occurred_at");--> statement-breakpoint
CREATE INDEX "social_account_workspace_idx" ON "social_account" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "social_account_workspace_platform" ON "social_account" USING btree ("workspace_id","platform");--> statement-breakpoint
CREATE UNIQUE INDEX "stripe_webhook_event_stripe_event_idx" ON "stripe_webhook_event" USING btree ("stripe_event_id");--> statement-breakpoint
CREATE INDEX "stripe_webhook_event_status_idx" ON "stripe_webhook_event" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE UNIQUE INDEX "top_up_package_code_idx" ON "top_up_package" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "top_up_package_stripe_price_idx" ON "top_up_package" USING btree ("stripe_price_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_billing_account_workspace_idx" ON "workspace_billing_account" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_billing_account_customer_idx" ON "workspace_billing_account" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_subscription_stripe_subscription_idx" ON "workspace_subscription" USING btree ("stripe_subscription_id");