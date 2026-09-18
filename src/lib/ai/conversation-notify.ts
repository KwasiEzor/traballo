/**
 * TRB-071 — notify the artisan of a new AI conversation. Debounced to at
 * most once per visitor per hour so a visitor closing/reopening the widget
 * doesn't spam the feed — `leads.ai_conversation` is marked `digestable` in
 * the catalogue for a future proper digest (NOTIFICATIONS_PLAN.md §1); this
 * is the "temps réel immédiat" default until then.
 */
import { and, count, eq, gte, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiConversations } from "@/db/schema";
import { createNotification } from "@/lib/notifications/create";

const DEBOUNCE_MS = 60 * 60 * 1000;

export async function notifyNewConversation(input: {
  tenantId: string;
  conversationId: string;
  visitorId: string;
}): Promise<void> {
  try {
    const [row] = await db
      .select({ value: count() })
      .from(aiConversations)
      .where(
        and(
          eq(aiConversations.tenantId, input.tenantId),
          eq(aiConversations.visitorId, input.visitorId),
          ne(aiConversations.id, input.conversationId),
          gte(aiConversations.createdAt, new Date(Date.now() - DEBOUNCE_MS))
        )
      );
    if ((row?.value ?? 0) > 0) return;

    await createNotification({
      tenantId: input.tenantId,
      type: "leads.ai_conversation",
      title: "Nouvelle conversation avec l'agent IA",
      actionUrl: "/dashboard/agent",
    });
  } catch (err) {
    console.error("notifyNewConversation failed", err);
  }
}
