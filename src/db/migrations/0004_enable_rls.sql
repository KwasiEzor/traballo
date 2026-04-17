-- 0004_enable_rls.sql
-- Enables Row Level Security (RLS) and creates isolation policies for all tenant-scoped tables.

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
