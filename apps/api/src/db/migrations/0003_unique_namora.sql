DO $$ BEGIN
 CREATE TYPE "public"."replay_source" AS ENUM('cluster', 'event_ids', 'golden_set', 'recent');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."replay_status" AS ENUM('queued', 'running', 'completed', 'failed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "replay_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"source_type" "replay_source" NOT NULL,
	"source_ref" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"new_prompt" text NOT NULL,
	"new_prompt_label" text,
	"model" text NOT NULL,
	"total_events" integer DEFAULT 0 NOT NULL,
	"completed_events" integer DEFAULT 0 NOT NULL,
	"improved_count" integer DEFAULT 0 NOT NULL,
	"regressed_count" integer DEFAULT 0 NOT NULL,
	"same_count" integer DEFAULT 0 NOT NULL,
	"pass_rate_old" double precision,
	"pass_rate_new" double precision,
	"results" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "replay_status" DEFAULT 'queued' NOT NULL,
	"error" text,
	"triggered_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "replay_runs" ADD CONSTRAINT "replay_runs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "replay_runs" ADD CONSTRAINT "replay_runs_triggered_by_user_id_users_id_fk" FOREIGN KEY ("triggered_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "replay_runs_product_created_idx" ON "replay_runs" USING btree ("product_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "replay_runs_status_idx" ON "replay_runs" USING btree ("status");