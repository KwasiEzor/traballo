"use server";

import { unstable_rethrow } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { pushSubscriptions } from "@/db/schema";

export type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

/** Called once the browser grants permission and `pushManager.subscribe()` resolves. */
export async function savePushSubscription(
  subscription: PushSubscriptionInput
): Promise<{ error?: string }> {
  const { tenantId, userId } = await requireAuth();
  try {
    await withTenant(tenantId, (tx) =>
      tx
        .insert(pushSubscriptions)
        .values({
          tenantId,
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        })
        .onConflictDoNothing({ target: pushSubscriptions.endpoint })
    );
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Impossible d'activer les notifications push." };
  }
  return {};
}

/** Called when the user turns every push toggle off, or the browser drops the subscription. */
export async function deletePushSubscription(endpoint: string): Promise<{ error?: string }> {
  const { tenantId } = await requireAuth();
  try {
    await withTenant(tenantId, (tx) =>
      tx
        .delete(pushSubscriptions)
        .where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.tenantId, tenantId)))
    );
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Impossible de désactiver les notifications push." };
  }
  return {};
}
