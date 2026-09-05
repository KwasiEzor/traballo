CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Platform-global, admin-managed, secret-bearing. Only the owner connection
-- (bootstrap / migrations / server routes) may touch it; the RLS-bound
-- `authenticated` role gets nothing.
ALTER TABLE "app_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON TABLE "app_settings" FROM authenticated;
