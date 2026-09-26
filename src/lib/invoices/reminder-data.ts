import { and, eq, inArray, lt } from "drizzle-orm";
import { db, type DB } from "@/lib/db";
import { artisanProfiles, clients, invoices, sites, tenants } from "@/db/schema";
import {
  claimDelivery,
  deliveredKinds,
  releaseDelivery,
} from "@/lib/notifications/ledger";
import type { PlanGate } from "@/lib/notifications/types";
import { pdfFromDataUrl } from "./reminders";

/**
 * Data access for the invoice-reminder cron. A system job across tenants: it
 * runs on the owner connection (`db`, no RLS) and every write filters
 * `tenant_id` explicitly. Core `db.select()` only (the relational builder
 * hangs through Neon's transaction pooler, see .claude/rules/db.md).
 */

export type ReminderCandidate = {
  invoiceId: string;
  tenantId: string;
  plan: PlanGate;
  status: "sent" | "viewed" | "overdue";
  invoiceNumber: string;
  total: string;
  dueDate: string;
  clientName: string;
  clientEmail: string | null;
  businessName: string;
  artisanEmail: string;
  artisanPhone: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  iban: string | null;
  remindersEnabled: boolean;
  remindersPaused: boolean;
};

const UNPAID = ["sent", "viewed", "overdue"] as const;

const candidateColumns = {
  invoiceId: invoices.id,
  tenantId: invoices.tenantId,
  plan: tenants.plan,
  status: invoices.status,
  invoiceNumber: invoices.invoiceNumber,
  total: invoices.total,
  dueDate: invoices.dueDate,
  clientName: clients.name,
  clientEmail: clients.email,
  businessName: artisanProfiles.businessName,
  artisanEmail: artisanProfiles.email,
  artisanPhone: artisanProfiles.phone,
  logoUrl: artisanProfiles.logoUrl,
  primaryColor: sites.primaryColor,
  iban: artisanProfiles.iban,
  remindersEnabled: artisanProfiles.invoiceReminders,
  remindersPaused: invoices.remindersPaused,
};

/** Invoice + client + artisan identity, everything a reminder needs. */
function candidates(executor: DB) {
  return executor
    .select(candidateColumns)
    .from(invoices)
    .innerJoin(tenants, eq(tenants.id, invoices.tenantId))
    .innerJoin(
      clients,
      and(eq(clients.id, invoices.clientId), eq(clients.tenantId, invoices.tenantId))
    )
    .innerJoin(artisanProfiles, eq(artisanProfiles.tenantId, invoices.tenantId))
    .leftJoin(sites, eq(sites.tenantId, invoices.tenantId));
}

/** Unpaid invoices past their due date, for active tenants (cron). */
export async function findReminderCandidates(
  today: string,
  limit = 500
): Promise<ReminderCandidate[]> {
  const rows = await candidates(db)
    .where(
      and(
        inArray(invoices.status, [...UNPAID]),
        lt(invoices.dueDate, today),
        eq(tenants.status, "active")
      )
    )
    .orderBy(invoices.dueDate)
    .limit(limit);
  return rows as ReminderCandidate[];
}

/**
 * One invoice of the tenant, for the artisan's "Relancer" button. Takes the
 * caller's `withTenant` transaction (RLS) and filters `tenant_id` too.
 */
export async function loadReminderCandidate(
  tx: DB,
  invoiceId: string,
  tenantId: string
): Promise<(Omit<ReminderCandidate, "status"> & { status: string }) | null> {
  const [row] = await candidates(tx)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)))
    .limit(1);
  return row ?? null;
}

/** `sent` / `viewed` → `overdue`. False if another run already did it. */
export async function markOverdue(
  invoiceId: string,
  tenantId: string
): Promise<boolean> {
  const rows = await db
    .update(invoices)
    .set({ status: "overdue", updatedAt: new Date() })
    .where(
      and(
        eq(invoices.id, invoiceId),
        eq(invoices.tenantId, tenantId),
        inArray(invoices.status, ["sent", "viewed"])
      )
    )
    .returning({ id: invoices.id });
  return rows.length > 0;
}

const LEDGER = { entityType: "invoice", channel: "email" } as const;

/** Reminder kinds already sent, per invoice. */
export function sentReminderKinds(
  invoiceIds: string[]
): Promise<Map<string, Set<string>>> {
  return deliveredKinds(LEDGER.entityType, invoiceIds, LEDGER.channel);
}

/**
 * Reserve a reminder in the ledger before sending it: false = a concurrent
 * or earlier run holds it.
 */
export function claimReminder(
  tenantId: string,
  invoiceId: string,
  kind: string
): Promise<boolean> {
  return claimDelivery({ tenantId, entityId: invoiceId, kind, ...LEDGER });
}

/** Drop a claim whose e-mail failed, so the next run retries it. */
export function releaseReminder(
  tenantId: string,
  invoiceId: string,
  kind: string
): Promise<void> {
  return releaseDelivery({ tenantId, entityId: invoiceId, kind, ...LEDGER });
}

/** The invoice PDF, loaded only when a reminder actually goes out. */
export async function loadInvoicePdf(
  invoiceId: string,
  tenantId: string
): Promise<Buffer | null> {
  const [row] = await db
    .select({ pdfUrl: invoices.pdfUrl })
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)))
    .limit(1);
  return pdfFromDataUrl(row?.pdfUrl ?? null);
}
