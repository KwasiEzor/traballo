/**
 * src/lib/security/lead-cap.ts
 * Hard per-tenant daily cap on inbound leads from the public vitrine.
 *
 * This is the guarantee: whatever gets past Turnstile and the rate limiter,
 * a single artisan site can only generate a bounded number of lead emails +
 * notifications per day. Worst case under attack is a fixed pile of junk
 * rows, never an unbounded Resend spend or a wrecked sending reputation.
 *
 * The counter is derived from rows already written — `notifications` of a
 * lead type, created since 00:00 UTC — so there is no extra table and the
 * count is exact and shared across instances.
 *
 * `SITE_LEAD_DAILY_CAP` overrides the default (30).
 */

import { and, count, gte, inArray, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications } from "@/db/schema";

const LEAD_NOTIFICATION_TYPES = ["leads.site_enquiry", "leads.ai_lead"];
const DEFAULT_CAP = 30;

export function leadDailyCap(): number {
  const raw = Number(process.env.SITE_LEAD_DAILY_CAP);
  return Number.isInteger(raw) && raw > 0 ? raw : DEFAULT_CAP;
}

export function startOfUtcDay(now: Date = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

/**
 * True when `tenantId` has already reached its lead cap for the current UTC
 * day. Best-effort: a DB error resolves to `false` (fail open) so a transient
 * outage never silently swallows a real customer's enquiry.
 */
export async function tenantLeadCapReached(tenantId: string): Promise<boolean> {
  try {
    const [row] = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.tenantId, tenantId),
          inArray(notifications.type, LEAD_NOTIFICATION_TYPES),
          gte(notifications.createdAt, startOfUtcDay())
        )
      );
    return (row?.value ?? 0) >= leadDailyCap();
  } catch (err) {
    console.error("tenantLeadCapReached failed", err);
    return false;
  }
}
