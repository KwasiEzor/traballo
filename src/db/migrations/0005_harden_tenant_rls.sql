-- 0005_harden_tenant_rls.sql
-- Replaces permissive RLS policies with strict tenant-scoped policies.

ALTER TABLE "invoice_items" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;
ALTER TABLE "ai_messages" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;

UPDATE "invoice_items" AS ii
SET "tenant_id" = i."tenant_id"
FROM "invoices" AS i
WHERE ii."invoice_id" = i."id"
  AND ii."tenant_id" IS NULL;

UPDATE "ai_messages" AS m
SET "tenant_id" = c."tenant_id"
FROM "ai_conversations" AS c
WHERE m."conversation_id" = c."id"
  AND m."tenant_id" IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "invoice_items" WHERE "tenant_id" IS NULL) THEN
        RAISE EXCEPTION 'invoice_items.tenant_id could not be backfilled';
    END IF;

    IF EXISTS (SELECT 1 FROM "ai_messages" WHERE "tenant_id" IS NULL) THEN
        RAISE EXCEPTION 'ai_messages.tenant_id could not be backfilled';
    END IF;

    ALTER TABLE "invoice_items" ALTER COLUMN "tenant_id" SET NOT NULL;
    ALTER TABLE "ai_messages" ALTER COLUMN "tenant_id" SET NOT NULL;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'invoice_items_tenant_id_tenants_id_fk'
    ) THEN
        ALTER TABLE "invoice_items"
            ADD CONSTRAINT "invoice_items_tenant_id_tenants_id_fk"
            FOREIGN KEY ("tenant_id")
            REFERENCES "public"."tenants"("id")
            ON DELETE cascade
            ON UPDATE no action;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ai_messages_tenant_id_tenants_id_fk'
    ) THEN
        ALTER TABLE "ai_messages"
            ADD CONSTRAINT "ai_messages_tenant_id_tenants_id_fk"
            FOREIGN KEY ("tenant_id")
            REFERENCES "public"."tenants"("id")
            ON DELETE cascade
            ON UPDATE no action;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "invoice_items_tenant_id_idx"
    ON "invoice_items" USING btree ("tenant_id");
CREATE INDEX IF NOT EXISTS "ai_messages_tenant_id_idx"
    ON "ai_messages" USING btree ("tenant_id");

DO $$
DECLARE
    t text;
    p record;
    tenant_tables text[] := ARRAY[
        'artisan_profiles',
        'sites',
        'clients',
        'invoices',
        'invoice_items',
        'appointments',
        'availability',
        'ai_agent_config',
        'ai_conversations',
        'ai_messages'
    ];
BEGIN
    FOREACH t IN ARRAY tenant_tables LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);

        FOR p IN
            SELECT policyname
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', p.policyname, t);
        END LOOP;

        EXECUTE format(
            'CREATE POLICY %I ON %I FOR SELECT TO authenticated USING ((tenant_id)::text = current_setting(''app.current_tenant_id'', true))',
            t || '_select',
            t
        );
        EXECUTE format(
            'CREATE POLICY %I ON %I FOR INSERT TO authenticated WITH CHECK ((tenant_id)::text = current_setting(''app.current_tenant_id'', true))',
            t || '_insert',
            t
        );
        EXECUTE format(
            'CREATE POLICY %I ON %I FOR UPDATE TO authenticated USING ((tenant_id)::text = current_setting(''app.current_tenant_id'', true)) WITH CHECK ((tenant_id)::text = current_setting(''app.current_tenant_id'', true))',
            t || '_update',
            t
        );
        EXECUTE format(
            'CREATE POLICY %I ON %I FOR DELETE TO authenticated USING ((tenant_id)::text = current_setting(''app.current_tenant_id'', true))',
            t || '_delete',
            t
        );
    END LOOP;
END $$;

DO $$
DECLARE
    p record;
BEGIN
    ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
    ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "users" FORCE ROW LEVEL SECURITY;

    FOR p IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'tenants'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', p.policyname, 'tenants');
    END LOOP;

    FOR p IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', p.policyname, 'users');
    END LOOP;

    CREATE POLICY tenants_select ON "tenants"
        FOR SELECT TO authenticated
        USING ((id)::text = current_setting('app.current_tenant_id', true));

    CREATE POLICY tenants_update ON "tenants"
        FOR UPDATE TO authenticated
        USING ((id)::text = current_setting('app.current_tenant_id', true))
        WITH CHECK ((id)::text = current_setting('app.current_tenant_id', true));

    CREATE POLICY users_select ON "users"
        FOR SELECT TO authenticated
        USING (
            (tenant_id)::text = current_setting('app.current_tenant_id', true)
            OR (id)::text = coalesce(((nullif(current_setting('request.jwt.claims', true), ''))::jsonb ->> 'sub'), '')
        );

    CREATE POLICY users_insert ON "users"
        FOR INSERT TO authenticated
        WITH CHECK ((tenant_id)::text = current_setting('app.current_tenant_id', true));

    CREATE POLICY users_update ON "users"
        FOR UPDATE TO authenticated
        USING (
            (tenant_id)::text = current_setting('app.current_tenant_id', true)
            OR (id)::text = coalesce(((nullif(current_setting('request.jwt.claims', true), ''))::jsonb ->> 'sub'), '')
        )
        WITH CHECK ((tenant_id)::text = current_setting('app.current_tenant_id', true));

    CREATE POLICY users_delete ON "users"
        FOR DELETE TO authenticated
        USING ((tenant_id)::text = current_setting('app.current_tenant_id', true));
END $$;
