"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { setNotificationPref } from "@/lib/notifications/prefs";
import type { NotificationCategory } from "@/lib/notifications/types";

export async function toggleNotificationPrefAction(input: {
  category: NotificationCategory;
  channel: "email" | "in_app" | "push" | "sms";
  enabled: boolean;
}): Promise<{ error?: string }> {
  const { tenantId, userId } = await requireAuth();
  try {
    await withTenant(tenantId, (tx) =>
      setNotificationPref(tx, {
        tenantId,
        userId,
        category: input.category,
        channel: input.channel,
        enabled: input.enabled,
      })
    );
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Impossible d'enregistrer cette préférence." };
  }
  revalidatePath("/dashboard/settings");
  return {};
}
