"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { markNotificationsRead } from "@/lib/notifications/feed";
import { err, errors, ok, type Result } from "@/lib/result";

const idSchema = z.uuid();

const dbError = {
  code: "DB_ERROR" as const,
  message: "Impossible de mettre à jour les notifications",
};

export async function markNotificationReadAction(
  id: string
): Promise<Result<{ updated: number }>> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return err(errors.validation(parsed.error.issues));

  try {
    const { tenantId, userId } = await requireAuth();
    const updated = await markNotificationsRead(tenantId, userId, [parsed.data]);
    // Bell lives in the dashboard layout: refresh the whole shell.
    revalidatePath("/dashboard", "layout");
    return ok({ updated });
  } catch (e) {
    console.error("markNotificationReadAction failed", e);
    return err(dbError);
  }
}

export async function markAllNotificationsReadAction(): Promise<
  Result<{ updated: number }>
> {
  try {
    const { tenantId, userId } = await requireAuth();
    const updated = await markNotificationsRead(tenantId, userId);
    revalidatePath("/dashboard", "layout");
    return ok({ updated });
  } catch (e) {
    console.error("markAllNotificationsReadAction failed", e);
    return err(dbError);
  }
}
