import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { notificationDeliveries } from "@/db/schema";

/**
 * Idempotency ledger for scheduled / once-only sends (`notification_deliveries`,
 * unique on entity_type + entity_id + kind + channel). Claim before sending,
 * release if the send fails: a re-run or a concurrent run never sends twice,
 * and a failed send is retried next time.
 *
 * Owner connection only (the table is closed to `authenticated`); callers
 * pass the tenant they already resolved.
 */

export type DeliveryKey = {
  tenantId: string;
  entityType: string;
  entityId: string;
  kind: string;
  channel: string;
};

/** False if someone else already holds (or sent) this delivery. */
export async function claimDelivery(key: DeliveryKey): Promise<boolean> {
  const rows = await db
    .insert(notificationDeliveries)
    .values(key)
    .onConflictDoNothing()
    .returning({ id: notificationDeliveries.id });
  return rows.length > 0;
}

export async function releaseDelivery(key: DeliveryKey): Promise<void> {
  await db
    .delete(notificationDeliveries)
    .where(
      and(
        eq(notificationDeliveries.tenantId, key.tenantId),
        eq(notificationDeliveries.entityType, key.entityType),
        eq(notificationDeliveries.entityId, key.entityId),
        eq(notificationDeliveries.kind, key.kind),
        eq(notificationDeliveries.channel, key.channel)
      )
    );
}

/** Kinds already delivered on `channel`, per entity id. */
export async function deliveredKinds(
  entityType: string,
  entityIds: string[],
  channel: string
): Promise<Map<string, Set<string>>> {
  const delivered = new Map<string, Set<string>>();
  if (entityIds.length === 0) return delivered;
  const rows = await db
    .select({
      entityId: notificationDeliveries.entityId,
      kind: notificationDeliveries.kind,
    })
    .from(notificationDeliveries)
    .where(
      and(
        eq(notificationDeliveries.entityType, entityType),
        eq(notificationDeliveries.channel, channel),
        inArray(notificationDeliveries.entityId, entityIds)
      )
    );
  for (const r of rows) {
    if (!delivered.has(r.entityId)) delivered.set(r.entityId, new Set());
    delivered.get(r.entityId)!.add(r.kind);
  }
  return delivered;
}
