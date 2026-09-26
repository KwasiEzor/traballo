import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications, tenants } from "@/db/schema";
import {
  notificationMeta,
  planAllows,
  resolveChannels,
  type NotificationType,
  type PlanGate,
} from "./types";
import { disabledChannelsFor } from "./prefs";
import { sendArtisanEmail } from "./email";
import { NotificationEmail } from "@/lib/email/templates/notification-email";

export type CreateNotificationInput = {
  tenantId: string;
  /** Recipient. Omit to address the whole tenant (any owner). */
  userId?: string | null;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  /**
   * Also e-mail the artisan (generic `NotificationEmail` built from title /
   * body / actionUrl), if the type has an e-mail channel and the recipient
   * kept it on. Callers that send their own dedicated e-mail leave it out.
   */
  email?: { subject: string; cta?: string };
  /**
   * Skip the plan-gate check — used when the caller already knows the tenant
   * is entitled, or for operator notifications that are not tenant-scoped in
   * the product sense.
   */
  force?: boolean;
};

/**
 * The single entry point for emitting a notification. Resolves the channels
 * once (`resolveChannels`: catalogue defaults minus the recipient's
 * preferences), then e-mails the artisan if asked and allowed, and writes the
 * in-app feed row unless that channel is off. Push is layered on later.
 *
 * Best-effort: never throws. A notification failing must not break the
 * business action that triggered it.
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<{ id: string } | null> {
  try {
    if (!input.force) {
      const [tenant] = await db
        .select({ plan: tenants.plan })
        .from(tenants)
        .where(eq(tenants.id, input.tenantId))
        .limit(1);
      if (!tenant) return null;
      if (!planAllows(input.type, tenant.plan as PlanGate)) return null;
    }

    const disabled = await disabledChannelsFor(
      input.tenantId,
      input.userId ?? null,
      notificationMeta(input.type).category
    );
    const channels = resolveChannels(input.type, disabled);

    if (input.email && channels.includes("email")) {
      await sendArtisanEmail(input.tenantId, {
        subject: input.email.subject,
        react: NotificationEmail({
          heading: input.title,
          body: input.body,
          actionUrl: input.actionUrl,
          cta: input.email.cta,
        }),
      });
    }

    if (!channels.includes("in_app")) return null;

    const [row] = await db
      .insert(notifications)
      .values({
        tenantId: input.tenantId,
        userId: input.userId ?? null,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        data: input.data ?? null,
        actionUrl: input.actionUrl ?? null,
      })
      .returning({ id: notifications.id });

    return row ?? null;
  } catch (err) {
    console.error("createNotification failed", err);
    return null;
  }
}
