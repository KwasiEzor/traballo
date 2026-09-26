import { and, eq, sql } from "drizzle-orm";
import { db, type DB } from "@/lib/db";
import { withTenant } from "@/lib/db/tenant";
import { notificationPrefs, users } from "@/db/schema";
import {
  CONFIGURABLE_CATEGORIES,
  isConfigurableCategory,
  type ConfigurableCategory,
  type NotificationCategory,
  type NotificationChannel,
} from "./types";

/**
 * Per-user notification preferences (Phase 1b). A missing row means the
 * catalogue defaults: every channel on. Locked channels (`alwaysOn`,
 * transactional) are enforced by `resolveChannels`, not here.
 *
 * Dashboard reads / writes go through `withTenant` (RLS) **and** filter
 * `tenant_id`. The delivery-time lookup runs on the owner connection, like
 * the rest of `createNotification`, with an explicit `tenant_id` filter.
 */

export type ChannelPrefs = { in_app: boolean; email: boolean };
export type NotificationPrefs = Record<ConfigurableCategory, ChannelPrefs>;

type PrefRow = { category: string; inApp: boolean; email: boolean };

export function mergePrefs(rows: PrefRow[]): NotificationPrefs {
  const prefs = Object.fromEntries(
    CONFIGURABLE_CATEGORIES.map((c) => [c, { in_app: true, email: true }])
  ) as NotificationPrefs;
  for (const row of rows) {
    if (isConfigurableCategory(row.category)) {
      prefs[row.category] = { in_app: row.inApp, email: row.email };
    }
  }
  return prefs;
}

export function disabledChannels(prefs: ChannelPrefs): NotificationChannel[] {
  const off: NotificationChannel[] = [];
  if (!prefs.in_app) off.push("in_app");
  if (!prefs.email) off.push("email");
  return off;
}

export async function readPrefs(
  tx: DB,
  tenantId: string,
  userId: string
): Promise<NotificationPrefs> {
  const rows = await tx
    .select({
      category: notificationPrefs.category,
      inApp: notificationPrefs.inApp,
      email: notificationPrefs.email,
    })
    .from(notificationPrefs)
    .where(
      and(
        eq(notificationPrefs.tenantId, tenantId),
        eq(notificationPrefs.userId, userId)
      )
    );
  return mergePrefs(rows);
}

/** Upsert one row per configurable category. */
export async function writePrefs(
  tx: DB,
  tenantId: string,
  userId: string,
  prefs: NotificationPrefs
): Promise<void> {
  await tx
    .insert(notificationPrefs)
    .values(
      CONFIGURABLE_CATEGORIES.map((category) => ({
        tenantId,
        userId,
        category,
        inApp: prefs[category].in_app,
        email: prefs[category].email,
      }))
    )
    .onConflictDoUpdate({
      target: [notificationPrefs.userId, notificationPrefs.category],
      set: {
        inApp: sql`excluded.in_app`,
        email: sql`excluded.email`,
        updatedAt: sql`now()`,
      },
    });
}

export function getNotificationPrefs(
  tenantId: string,
  userId: string
): Promise<NotificationPrefs> {
  return withTenant(tenantId, (tx) => readPrefs(tx, tenantId, userId));
}

export function saveNotificationPrefs(
  tenantId: string,
  userId: string,
  prefs: NotificationPrefs
): Promise<void> {
  return withTenant(tenantId, (tx) => writePrefs(tx, tenantId, userId, prefs));
}

/**
 * Channels the recipient turned off for `category`, at delivery time. A
 * tenant-wide notification (`userId` null) follows the owner's prefs.
 *
 * Fails open: if the lookup errors, deliver with the defaults — a
 * notification the artisan muted beats a lead alert that never arrives.
 */
export async function disabledChannelsFor(
  tenantId: string,
  userId: string | null,
  category: NotificationCategory
): Promise<NotificationChannel[]> {
  if (!isConfigurableCategory(category)) return [];
  try {
    const base = db
      .select({ inApp: notificationPrefs.inApp, email: notificationPrefs.email })
      .from(notificationPrefs);
    const rows = userId
      ? await base
          .where(
            and(
              eq(notificationPrefs.tenantId, tenantId),
              eq(notificationPrefs.userId, userId),
              eq(notificationPrefs.category, category)
            )
          )
          .limit(1)
      : await base
          .innerJoin(users, eq(users.id, notificationPrefs.userId))
          .where(
            and(
              eq(notificationPrefs.tenantId, tenantId),
              eq(notificationPrefs.category, category),
              eq(users.role, "owner")
            )
          )
          .limit(1);
    const row = rows[0];
    return row ? disabledChannels({ in_app: row.inApp, email: row.email }) : [];
  } catch (err) {
    console.error("disabledChannelsFor failed, using defaults", err);
    return [];
  }
}
