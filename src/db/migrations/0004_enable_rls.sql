-- 0004_enable_rls.sql
-- Enables Row Level Security (RLS) and creates isolation policies for all tenant-scoped tables.

-- Bootstrap the Postgres roles that RLS policies and withTenant() rely on.
-- Supabase pre-creates these; Neon (and vanilla Postgres) does not.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        BEGIN
            CREATE ROLE service_role NOLOGIN BYPASSRLS;
        EXCEPTION WHEN insufficient_privilege THEN
            -- Not superuser: create without BYPASSRLS; 0005 adds permissive
            -- service_role policies as a fallback.
            CREATE ROLE service_role NOLOGIN;
        END;
    END IF;
END $$;

GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO service_role;

-- The login role must be able to `SET ROLE authenticated` inside withTenant().
GRANT authenticated, service_role TO CURRENT_USER;

-- List of tables to enable RLS
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'artisan_profiles',
        'sites',
        'clients',
        'invoices',
        'invoice_items',
        'appointments',
        'availability',
        'ai_agent_config',
        'ai_conversations',
        'ai_messages',
        'users'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I USING (tenant_id = (current_setting(''app.current_tenant_id'')::uuid))', t);
    END LOOP;
END $$;

-- Special policy for the tenants table itself
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "tenants";
CREATE POLICY tenant_isolation ON "tenants" USING (id = (current_setting('app.current_tenant_id')::uuid));
