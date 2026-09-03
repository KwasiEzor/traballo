-- 0006_neon_auth_and_roles.sql
-- Better Auth core tables + switch users.id (uuid -> text, FK to "user").
-- Role bootstrap lives in 0004; this migration only wires the auth schema.

CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
-- users.id: uuid -> text. Drop dependent policies, convert, recreate.
DROP POLICY IF EXISTS "users_select" ON "users";--> statement-breakpoint
DROP POLICY IF EXISTS "users_insert" ON "users";--> statement-breakpoint
DROP POLICY IF EXISTS "users_update" ON "users";--> statement-breakpoint
DROP POLICY IF EXISTS "users_delete" ON "users";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "users_select" ON "users"
	FOR SELECT TO authenticated
	USING (
		(tenant_id)::text = current_setting('app.current_tenant_id', true)
		OR id = coalesce(nullif(current_setting('app.current_user_id', true), ''), '')
	);--> statement-breakpoint
CREATE POLICY "users_insert" ON "users"
	FOR INSERT TO authenticated
	WITH CHECK ((tenant_id)::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "users_update" ON "users"
	FOR UPDATE TO authenticated
	USING (
		(tenant_id)::text = current_setting('app.current_tenant_id', true)
		OR id = coalesce(nullif(current_setting('app.current_user_id', true), ''), '')
	)
	WITH CHECK ((tenant_id)::text = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "users_delete" ON "users"
	FOR DELETE TO authenticated
	USING ((tenant_id)::text = current_setting('app.current_tenant_id', true));
