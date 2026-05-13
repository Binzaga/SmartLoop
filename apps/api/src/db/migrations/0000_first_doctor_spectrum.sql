DO $$ BEGIN
 CREATE TYPE "public"."alert_status" AS ENUM('firing', 'resolved');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."cluster_status" AS ENUM('active', 'resolved', 'monitoring');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."rating" AS ENUM('up', 'down', 'neutral');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."regression_status" AS ENUM('queued', 'running', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alert_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"condition" jsonb NOT NULL,
	"channels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_triggered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" uuid NOT NULL,
	"product_id" text NOT NULL,
	"title" text NOT NULL,
	"severity" text DEFAULT 'warning' NOT NULL,
	"context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "alert_status" DEFAULT 'firing' NOT NULL,
	"triggered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"representative_event_ids" uuid[] DEFAULT '{}' NOT NULL,
	"event_count_total" integer DEFAULT 0 NOT NULL,
	"event_count_24h" integer DEFAULT 0 NOT NULL,
	"event_count_7d" integer DEFAULT 0 NOT NULL,
	"trend" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "cluster_status" DEFAULT 'active' NOT NULL,
	"root_cause_analysis" text,
	"suggested_fix" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"org_id" text NOT NULL,
	"conversation_id" text,
	"user_id_hash" text,
	"parent_event_id" uuid,
	"input_message" text,
	"output_message" text,
	"model" text,
	"prompt_version_id" uuid,
	"prompt_version_label" text,
	"tokens_input" integer DEFAULT 0,
	"tokens_output" integer DEFAULT 0,
	"tokens_cache_hit" integer DEFAULT 0,
	"cost_usd" double precision DEFAULT 0,
	"latency_ms" integer DEFAULT 0,
	"tools_called" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"scores" jsonb,
	"judge_reasoning" text,
	"cluster_id" uuid,
	"status" text DEFAULT 'success' NOT NULL,
	"error_message" text,
	"language" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"product_id" text NOT NULL,
	"rating" "rating" NOT NULL,
	"reasons" text[] DEFAULT '{}' NOT NULL,
	"comment" text,
	"user_id_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "golden_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"input" text NOT NULL,
	"expected_criteria" text NOT NULL,
	"category" text,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orgs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"owner_team" text,
	"api_key_hash" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prompt_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"version" text NOT NULL,
	"content" text NOT NULL,
	"diff_from_parent" text,
	"is_current" boolean DEFAULT false NOT NULL,
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deployed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "regression_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"prompt_version_id" uuid,
	"total_cases" integer DEFAULT 0 NOT NULL,
	"passed_cases" integer DEFAULT 0 NOT NULL,
	"failed_cases" integer DEFAULT 0 NOT NULL,
	"results" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"triggered_by" text,
	"triggered_by_user" text,
	"status" "regression_status" DEFAULT 'queued' NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alerts" ADD CONSTRAINT "alerts_rule_id_alert_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."alert_rules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clusters" ADD CONSTRAINT "clusters_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_prompt_version_id_prompt_versions_id_fk" FOREIGN KEY ("prompt_version_id") REFERENCES "public"."prompt_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "golden_cases" ADD CONSTRAINT "golden_cases_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "regression_runs" ADD CONSTRAINT "regression_runs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "regression_runs" ADD CONSTRAINT "regression_runs_prompt_version_id_prompt_versions_id_fk" FOREIGN KEY ("prompt_version_id") REFERENCES "public"."prompt_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "alert_rules_product_enabled_idx" ON "alert_rules" USING btree ("product_id","enabled");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "alerts_product_status_idx" ON "alerts" USING btree ("product_id","status","triggered_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clusters_product_status_idx" ON "clusters" USING btree ("product_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clusters_product_category_idx" ON "clusters" USING btree ("product_id","category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_product_created_idx" ON "events" USING btree ("product_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_conversation_idx" ON "events" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_cluster_idx" ON "events" USING btree ("cluster_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events" USING btree ("product_id","status","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feedback_event_idx" ON "feedback" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feedback_product_rating_idx" ON "feedback" USING btree ("product_id","rating","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "golden_cases_product_idx" ON "golden_cases" USING btree ("product_id","enabled");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_org_idx" ON "products" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_api_key_idx" ON "products" USING btree ("api_key_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prompt_versions_product_idx" ON "prompt_versions" USING btree ("product_id","version");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "regression_runs_product_idx" ON "regression_runs" USING btree ("product_id","created_at");