CREATE TABLE "notification_prefs" (
	"tenant_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"in_app" boolean DEFAULT true NOT NULL,
	"email" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_prefs_user_id_category_pk" PRIMARY KEY("user_id","category")
);
--> statement-breakpoint
ALTER TABLE "notification_prefs" ADD CONSTRAINT "notification_prefs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_prefs" ADD CONSTRAINT "notification_prefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_prefs_tenant_id_idx" ON "notification_prefs" USING btree ("tenant_id");--> statement-breakpoint

-- notification_prefs: tenant-scoped. The dashboard reads and upserts the
-- current user's rows (INSERT ... ON CONFLICT DO UPDATE needs select, insert
-- and update). No delete policy: a reset writes the defaults back.
ALTER TABLE "notification_prefs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY notification_prefs_select ON "notification_prefs"
    FOR SELECT TO authenticated
    USING ((tenant_id)::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY notification_prefs_insert ON "notification_prefs"
    FOR INSERT TO authenticated
    WITH CHECK ((tenant_id)::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY notification_prefs_update ON "notification_prefs"
    FOR UPDATE TO authenticated
    USING ((tenant_id)::text = current_setting('app.current_tenant_id', true))
    WITH CHECK ((tenant_id)::text = current_setting('app.current_tenant_id', true));
