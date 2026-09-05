/**
 * src/lib/admin/audit.ts
 * Append-only trail of super-admin actions.
 */

import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminAuditLog } from "@/db/schema";

export async function logAdminAction(entry: {
  actorEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(adminAuditLog).values({
      actorEmail: entry.actorEmail,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      meta: entry.meta ?? null,
    });
  } catch (err) {
    console.error("[admin/audit] write failed:", err);
  }
}

export async function listAuditLog(opts: {
  limit?: number;
  cursor?: string;
} = {}): Promise<{
  entries: {
    id: string;
    actorEmail: string;
    action: string;
    targetType: string | null;
    targetId: string | null;
    meta: unknown;
    createdAt: Date;
  }[];
  nextCursor: string | null;
}> {
  const limit = Math.min(opts.limit ?? 50, 200);
  const rows = await db
    .select()
    .from(adminAuditLog)
    .where(
      opts.cursor
        ? sql`${adminAuditLog.createdAt} < ${opts.cursor}::timestamptz`
        : sql`true`
    )
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(limit + 1);

  const entries = rows.slice(0, limit);
  const nextCursor =
    rows.length > limit ? entries[entries.length - 1]!.createdAt.toISOString() : null;

  return { entries, nextCursor };
}
