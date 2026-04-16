/**
 * src/db/schema/index.ts
 * Point d'entrée du schéma Drizzle — exporte toutes les tables
 * Ce fichier est importé dans CLAUDE.md via @src/db/schema/index.ts
 * pour donner aux agents une vue complète du modèle de données
 */

export * from "./tenants";
export * from "./users";
export * from "./artisan-profiles";
export * from "./sites";
export * from "./clients";
export * from "./invoices";
export * from "./invoice-items";
export * from "./appointments";
export * from "./availability";
export * from "./ai-agent-config";
export * from "./ai-conversations";
export * from "./ai-messages";

/**
 * SCHÉMA RÉSUMÉ (pour référence rapide des agents)
 *
 * tenants              — artisans inscrits (1 tenant = 1 artisan/compte)
 *   id, slug, plan, stripe_customer_id, stripe_subscription_id
 *
 * artisan_profiles     — infos professionnelles de l'artisan
 *   tenant_id, business_name, owner_name, email, phone, whatsapp_number
 *   address, vat_number, iban, logo_url, trade_type
 *
 * sites                — configuration du site public de l'artisan
 *   tenant_id, template_id, primary_color, custom_domain, is_published
 *   meta_title, meta_description, sections (JSONB)
 *
 * clients              — carnet de contacts de l'artisan
 *   tenant_id, name, email, phone, address, notes
 *
 * invoices             — factures émises par l'artisan
 *   tenant_id, client_id, invoice_number, status, issue_date, due_date
 *   subtotal, tax_amount, total, pdf_url, sent_at, paid_at
 *   status: draft | sent | viewed | paid | overdue | cancelled
 *
 * invoice_items        — lignes d'une facture
 *   invoice_id, description, quantity, unit_price, tax_rate, total
 *
 * appointments         — rendez-vous
 *   tenant_id, client_id, title, start_time, end_time, status, notes
 *   status: pending | confirmed | cancelled | completed
 *
 * availability         — disponibilités hebdomadaires de l'artisan
 *   tenant_id, day_of_week (0=lun..6=dim), start_time, end_time
 *
 * ai_agent_config      — configuration de l'AI agent par artisan
 *   tenant_id, agent_name, is_enabled, tone, languages, business_context
 *   opening_message, off_hours_message
 *
 * ai_conversations     — conversations avec l'AI agent
 *   tenant_id, visitor_id, lead_name, lead_email, lead_phone, channel
 *
 * ai_messages          — messages d'une conversation
 *   conversation_id, role (user|assistant), content
 *
 * RÈGLE RLS : toutes les tables ont une policy tenant_isolation
 * RÈGLE INDEX : toutes les tables ont un index sur tenant_id
 */
