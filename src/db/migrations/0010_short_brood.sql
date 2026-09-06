CREATE TABLE "notification_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"kind" text NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"detail" text,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_deliveries_uniq" UNIQUE("entity_type","entity_id","kind","channel")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" text,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"data" jsonb,
	"action_url" text,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_deliveries_tenant_id_idx" ON "notification_deliveries" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "notifications_tenant_id_idx" ON "notifications" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "notifications_feed_idx" ON "notifications" USING btree ("user_id","read_at","created_at");--> statement-breakpoint

-- notification_deliveries: idempotency ledger for cron / fan-out sends.
-- Owner connection only (cron jobs); the tenant-facing role gets nothing.
ALTER TABLE "notification_deliveries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON TABLE "notification_deliveries" FROM authenticated;--> statement-breakpoint

-- notifications: tenant-scoped. The dashboard reads its own feed and marks
-- rows read; rows are only ever created through the owner connection.
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY notifications_select ON "notifications"
    FOR SELECT TO authenticated
    USING ((tenant_id)::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY notifications_update ON "notifications"
    FOR UPDATE TO authenticated
    USING ((tenant_id)::text = current_setting('app.current_tenant_id', true))
    WITH CHECK ((tenant_id)::text = current_setting('app.current_tenant_id', true));