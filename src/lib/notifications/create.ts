import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications, tenants } from "@/db/schema";
import {
  planAllows,
  type NotificationType,
  type PlanGate,
} from "./types";

export type CreateNotificationInput = {
  tenantId: string;
  /** Recipient. Omit to address the whole tenant (any owner). */
  userId?: string | null;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  /**
   * Skip the plan-gate check — used when the caller already knows the tenant
   * is entitled, or for operator notifications that are not tenant-scoped in
   * the product sense.
   */
  force?: boolean;
};

/**
 * The single entry point for emitting a notification. Writes the in-app
 * feed row; email / push fan-out is layered on in later phases and reads
 * the same input.
 *
 * Best-effort: never throws. A notification failing must not break the
 * business action that triggered it.
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<{ id: string } | null> {
  try {
    if (!input.force) {
      const [tenant] = await db
        .select({ plan: tenants.plan })
        .from(tenants)
        .where(eq(tenants.id, input.tenantId))
        .limit(1);
      if (!tenant) return null;
      if (!planAllows(input.type, tenant.plan as PlanGate)) return null;
    }

    const [row] = await db
      .insert(notifications)
      .values({
        tenantId: input.tenantId,
        userId: input.userId ?? null,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        data: input.data ?? null,
        actionUrl: input.actionUrl ?? null,
      })
      .returning({ id: notifications.id });

    return row ?? null;
  } catch (err) {
    console.error("createNotification failed", err);
    return null;
  }
}
