CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_uniq" UNIQUE("endpoint")
);
--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "push_subscriptions_tenant_id_idx" ON "push_subscriptions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint

-- push_subscriptions: tenant-scoped, written by the owning artisan's
-- browser through the authenticated (RLS) role when they opt into push;
-- purged by the owner connection (sendPush) on a dead subscription.
ALTER TABLE "push_subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY push_subscriptions_select ON "push_subscriptions"
    FOR SELECT TO authenticated
    USING ((tenant_id)::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY push_subscriptions_insert ON "push_subscriptions"
    FOR INSERT TO authenticated
    WITH CHECK ((tenant_id)::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY push_subscriptions_delete ON "push_subscriptions"
    FOR DELETE TO authenticated
    USING ((tenant_id)::text = current_setting('app.current_tenant_id', true));