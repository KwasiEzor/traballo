ALTER TABLE "artisan_profiles" ADD COLUMN "invoice_reminder_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "artisan_profiles" ADD COLUMN "invoice_reminder_template" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "reminder_override" text DEFAULT 'default' NOT NULL;