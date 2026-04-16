CREATE INDEX "artisan_profiles_tenant_id_idx" ON "artisan_profiles" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sites_tenant_id_idx" ON "sites" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "clients_tenant_id_idx" ON "clients" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "invoices_tenant_id_idx" ON "invoices" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "appointments_tenant_id_idx" ON "appointments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "availability_tenant_id_idx" ON "availability" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ai_agent_config_tenant_id_idx" ON "ai_agent_config" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ai_conversations_tenant_id_idx" ON "ai_conversations" USING btree ("tenant_id");