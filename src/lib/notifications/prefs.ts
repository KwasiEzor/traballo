import { and, eq } from "drizzle-orm";
import { db, type DB } from "@/lib/db";
import { notificationPrefs } from "@/db/schema";
import {
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
  type NotificationChannel,
} from "./types";

export type CategoryPrefs = Record<
  Extract<NotificationChannel, "email" | "in_app" | "push" | "sms">,
  boolean
>;

export type NotificationPrefsMap = Record<NotificationCategory, CategoryPrefs>;

const ALL_ON: CategoryPrefs = { email: true, in_app: true, push: true, sms: true };

function defaults(): NotificationPrefsMap {
  return Object.fromEntries(
    NOTIFICATION_CATEGORIES.map((c) => [c, { ...ALL_ON }])
  ) as NotificationPrefsMap;
}

/**
 * A user's channel toggles for every category, defaulting to "all on" for
 * categories with no stored row. Reads through the core `db.select()`
 * builder (not the relational query builder) — this runs outside a
 * transaction, and `db.query.*` is known to hang through the Neon pooler
 * there (see NOTIFICATIONS_PLAN.md §3.4).
 */
export async function getNotificationPrefs(
  tenantId: string,
  userId: string
): Promise<NotificationPrefsMap> {
  const rows = await db
    .select({
      category: notificationPrefs.category,
      email: notificationPrefs.email,
      inApp: notificationPrefs.inApp,
      push: notificationPrefs.push,
      sms: notificationPrefs.sms,
    })
    .from(notificationPrefs)
    .where(
      and(
        eq(notificationPrefs.tenantId, tenantId),
        eq(notificationPrefs.userId, userId)
      )
    );

  const prefs = defaults();
  for (const row of rows) {
    if (!(row.category in prefs)) continue;
    prefs[row.category as NotificationCategory] = {
      email: row.email,
      in_app: row.inApp,
      push: row.push,
      sms: row.sms,
    };
  }
  return prefs;
}

/** Channels a user turned off for one category, as `resolveChannels` expects. */
export function disabledChannels(
  prefs: NotificationPrefsMap,
  category: NotificationCategory
): NotificationChannel[] {
  const p = prefs[category];
  return (["email", "in_app", "push", "sms"] as const).filter((c) => !p[c]);
}

/**
 * Upsert one channel toggle. Runs through the caller's tenant-scoped
 * transaction (`withTenant`) so RLS applies — this is a user editing their
 * own preferences from the settings screen, not a system write.
 */
export async function setNotificationPref(
  tx: DB,
  input: {
    tenantId: string;
    userId: string;
    category: NotificationCategory;
    channel: keyof CategoryPrefs;
    enabled: boolean;
  }
): Promise<void> {
  const column = channelColumn(input.channel);
  await tx
    .insert(notificationPrefs)
    .values({
      tenantId: input.tenantId,
      userId: input.userId,
      category: input.category,
      [column]: input.enabled,
    })
    .onConflictDoUpdate({
      target: [notificationPrefs.userId, notificationPrefs.category],
      set: { [column]: input.enabled, updatedAt: new Date() },
    });
}

function channelColumn(channel: keyof CategoryPrefs): "email" | "inApp" | "push" | "sms" {
  switch (channel) {
    case "in_app":
      return "inApp";
    case "email":
    case "push":
    case "sms":
      return channel;
  }
}
