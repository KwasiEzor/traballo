"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { and, eq, isNull, or } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { notifications } from "@/db/schema";

export async function markReadAction(id: string): Promise<{ error?: string }> {
  const { tenantId, userId } = await requireAuth();
  try {
    await withTenant(tenantId, (tx) =>
      tx
        .update(notifications)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(notifications.id, id),
            eq(notifications.tenantId, tenantId),
            or(eq(notifications.userId, userId), isNull(notifications.userId))
          )
        )
    );
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Impossible de marquer cette notification comme lue." };
  }
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard", "layout");
  return {};
}

export async function markAllReadAction(): Promise<{ error?: string }> {
  const { tenantId, userId } = await requireAuth();
  try {
    await withTenant(tenantId, (tx) =>
      tx
        .update(notifications)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(notifications.tenantId, tenantId),
            isNull(notifications.readAt),
            or(eq(notifications.userId, userId), isNull(notifications.userId))
          )
        )
    );
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Impossible de marquer les notifications comme lues." };
  }
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard", "layout");
  return {};
}
