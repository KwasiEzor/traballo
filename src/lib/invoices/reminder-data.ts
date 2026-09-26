import { and, eq, inArray, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  artisanProfiles,
  clients,
  invoices,
  notificationDeliveries,
  sites,
  tenants,
} from "@/db/schema";
import type { PlanGate } from "@/lib/notifications/types";
import { pdfFromDataUrl, type ReminderKind } from "./reminders";

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
  remindersEnabled: boolean;
};

const UNPAID = ["sent", "viewed", "overdue"] as const;

/** Unpaid invoices past their due date, for active tenants. */
export async function findReminderCandidates(
  today: string,
  limit = 500
): Promise<ReminderCandidate[]> {
  const rows = await db
    .select({
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
      remindersEnabled: artisanProfiles.invoiceReminders,
    })
    .from(invoices)
    .innerJoin(tenants, eq(tenants.id, invoices.tenantId))
    .innerJoin(
      clients,
      and(eq(clients.id, invoices.clientId), eq(clients.tenantId, invoices.tenantId))
    )
    .innerJoin(artisanProfiles, eq(artisanProfiles.tenantId, invoices.tenantId))
    .leftJoin(sites, eq(sites.tenantId, invoices.tenantId))
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
export async function sentReminderKinds(
  invoiceIds: string[]
): Promise<Map<string, Set<string>>> {
  const sent = new Map<string, Set<string>>();
  if (invoiceIds.length === 0) return sent;
  const rows = await db
    .select({
      invoiceId: notificationDeliveries.entityId,
      kind: notificationDeliveries.kind,
    })
    .from(notificationDeliveries)
    .where(
      and(
        eq(notificationDeliveries.entityType, LEDGER.entityType),
        eq(notificationDeliveries.channel, LEDGER.channel),
        inArray(notificationDeliveries.entityId, invoiceIds)
      )
    );
  for (const r of rows) {
    if (!sent.has(r.invoiceId)) sent.set(r.invoiceId, new Set());
    sent.get(r.invoiceId)!.add(r.kind);
  }
  return sent;
}

/**
 * Reserve a reminder in the ledger before sending it. The unique key
 * `(entity_type, entity_id, kind, channel)` makes a concurrent or replayed
 * run back off: false = someone else holds it.
 */
export async function claimReminder(
  tenantId: string,
  invoiceId: string,
  kind: ReminderKind
): Promise<boolean> {
  const rows = await db
    .insert(notificationDeliveries)
    .values({ tenantId, entityId: invoiceId, kind, ...LEDGER })
    .onConflictDoNothing()
    .returning({ id: notificationDeliveries.id });
  return rows.length > 0;
}

/** Drop a claim whose e-mail failed, so the next run retries it. */
export async function releaseReminder(
  invoiceId: string,
  kind: ReminderKind
): Promise<void> {
  await db
    .delete(notificationDeliveries)
    .where(
      and(
        eq(notificationDeliveries.entityType, LEDGER.entityType),
        eq(notificationDeliveries.channel, LEDGER.channel),
        eq(notificationDeliveries.entityId, invoiceId),
        eq(notificationDeliveries.kind, kind)
      )
    );
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
