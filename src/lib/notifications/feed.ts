import { and, count, desc, eq, inArray, isNull, or, type SQL } from "drizzle-orm";
import { withTenant } from "@/lib/db/tenant";
import type { DB } from "@/lib/db";
import { notifications } from "@/db/schema";
import { paginate } from "./present";

/**
 * Read side of the in-app notification feed. Everything runs through
 * `withTenant` (RLS, role `authenticated`) **and** filters `tenant_id`
 * explicitly. Rows are written by `createNotification` (owner connection).
 *
 * The `read*` / `stampRead` functions take the transaction so they can be
 * exercised against a real database inside a rolled-back transaction.
 */

export const FEED_PAGE_SIZE = 20;
export const BELL_LIMIT = 10;

export type FeedItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  actionUrl: string | null;
  readAt: Date | null;
  createdAt: Date;
};

const feedColumns = {
  id: notifications.id,
  type: notifications.type,
  title: notifications.title,
  body: notifications.body,
  actionUrl: notifications.actionUrl,
  readAt: notifications.readAt,
  createdAt: notifications.createdAt,
};

/** Rows addressed to this user, or to the whole tenant (`user_id` null). */
function visibleTo(tenantId: string, userId: string): SQL {
  return and(
    eq(notifications.tenantId, tenantId),
    or(eq(notifications.userId, userId), isNull(notifications.userId))
  )!;
}

function unreadFor(tenantId: string, userId: string): SQL {
  return and(visibleTo(tenantId, userId), isNull(notifications.readAt))!;
}

export async function readSummary(
  tx: DB,
  tenantId: string,
  userId: string,
  limit: number = BELL_LIMIT
): Promise<{ unread: number; items: FeedItem[] }> {
  const [{ n }] = await tx
    .select({ n: count() })
    .from(notifications)
    .where(unreadFor(tenantId, userId));
  const items = await tx
    .select(feedColumns)
    .from(notifications)
    .where(visibleTo(tenantId, userId))
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
    .limit(limit);
  return { unread: n, items };
}

export async function readPage(
  tx: DB,
  tenantId: string,
  userId: string,
  opts: { page: number; unreadOnly: boolean }
): Promise<{
  items: FeedItem[];
  unread: number;
  total: number;
  page: number;
  pageCount: number;
}> {
  const scope = opts.unreadOnly
    ? unreadFor(tenantId, userId)
    : visibleTo(tenantId, userId);

  const [{ total }] = await tx
    .select({ total: count() })
    .from(notifications)
    .where(scope);
  const [{ unread }] = await tx
    .select({ unread: count() })
    .from(notifications)
    .where(unreadFor(tenantId, userId));

  const { page, pageCount, offset } = paginate(total, opts.page, FEED_PAGE_SIZE);
  const items = await tx
    .select(feedColumns)
    .from(notifications)
    .where(scope)
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
    .limit(FEED_PAGE_SIZE)
    .offset(offset);

  return { items, unread, total, page, pageCount };
}

/** Stamp `read_at` on unread rows visible to this user; `ids` narrows it. */
export async function stampRead(
  tx: DB,
  tenantId: string,
  userId: string,
  ids?: string[]
): Promise<number> {
  const conditions = [unreadFor(tenantId, userId)];
  if (ids) conditions.push(inArray(notifications.id, ids));
  const rows = await tx
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(...conditions))
    .returning({ id: notifications.id });
  return rows.length;
}

/** Unread count + latest items, for the topbar bell. */
export function getNotificationSummary(
  tenantId: string,
  userId: string,
  limit: number = BELL_LIMIT
): Promise<{ unread: number; items: FeedItem[] }> {
  return withTenant(tenantId, (tx) => readSummary(tx, tenantId, userId, limit));
}

/** Paginated feed for /dashboard/notifications. */
export function listNotifications(
  tenantId: string,
  userId: string,
  opts: { page: number; unreadOnly: boolean }
): ReturnType<typeof readPage> {
  return withTenant(tenantId, (tx) => readPage(tx, tenantId, userId, opts));
}

/**
 * Mark unread rows read. `ids` omitted = all of them; an empty list is a
 * no-op. Returns the number of rows updated.
 */
export async function markNotificationsRead(
  tenantId: string,
  userId: string,
  ids?: string[]
): Promise<number> {
  if (ids && ids.length === 0) return 0;
  return withTenant(tenantId, (tx) => stampRead(tx, tenantId, userId, ids));
}
