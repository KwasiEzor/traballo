import { and, count, eq, inArray, isNull, or } from "drizzle-orm";
import type { DB } from "@/lib/db";
import { notifications, type Notification } from "@/db/schema";
import { typesForCategory, type NotificationCategory } from "./types";

/**
 * A recipient sees their own notifications plus tenant-wide ones
 * (`user_id IS NULL`). Runs inside `withTenant` — the relational query
 * builder is safe there (it's the top-level `db.query.*` outside a
 * transaction that hangs through the Neon pooler).
 */
function recipientScope(tenantId: string, userId: string) {
  return and(
    eq(notifications.tenantId, tenantId),
    or(eq(notifications.userId, userId), isNull(notifications.userId))
  );
}

export async function getUnreadCount(
  tx: DB,
  tenantId: string,
  userId: string
): Promise<number> {
  const [row] = await tx
    .select({ n: count() })
    .from(notifications)
    .where(and(recipientScope(tenantId, userId), isNull(notifications.readAt)));
  return row?.n ?? 0;
}

export async function getRecentNotifications(
  tx: DB,
  tenantId: string,
  userId: string,
  limit = 10
): Promise<Notification[]> {
  return tx.query.notifications.findMany({
    where: recipientScope(tenantId, userId),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit,
  });
}

export const NOTIFICATIONS_PAGE_SIZE = 20;

export async function getNotificationsPage(
  tx: DB,
  tenantId: string,
  userId: string,
  options: { page: number; category?: NotificationCategory }
): Promise<{ rows: Notification[]; total: number }> {
  const { page, category } = options;
  const where = category
    ? and(
        recipientScope(tenantId, userId),
        inArray(notifications.type, typesForCategory(category))
      )
    : recipientScope(tenantId, userId);

  const [rows, [totalRow]] = await Promise.all([
    tx.query.notifications.findMany({
      where,
      orderBy: (n, { desc }) => [desc(n.createdAt)],
      limit: NOTIFICATIONS_PAGE_SIZE,
      offset: (page - 1) * NOTIFICATIONS_PAGE_SIZE,
    }),
    tx.select({ n: count() }).from(notifications).where(where),
  ]);

  return { rows, total: totalRow?.n ?? 0 };
}
