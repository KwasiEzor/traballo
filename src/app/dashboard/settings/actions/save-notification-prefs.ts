"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import {
  saveNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/notifications/prefs";
import {
  CONFIGURABLE_CATEGORIES,
  categoryChannels,
} from "@/lib/notifications/types";
import { err, errors, ok, type Result } from "@/lib/result";

const channelsSchema = z.strictObject({
  in_app: z.boolean(),
  email: z.boolean(),
});

const prefsSchema = z.strictObject({
  leads: channelsSchema,
  invoices: channelsSchema,
  appointments: channelsSchema,
});

export async function saveNotificationPrefsAction(
  input: unknown
): Promise<Result<NotificationPrefs>> {
  const parsed = prefsSchema.safeParse(input);
  if (!parsed.success) return err(errors.validation(parsed.error.issues));

  try {
    const { tenantId, userId, plan, impersonating } = await requireAuth();
    if (impersonating) {
      return err({
        code: "FORBIDDEN",
        message: "Action indisponible en mode support.",
      });
    }

    // A locked channel stays on whatever the client sent.
    const prefs: NotificationPrefs = parsed.data;
    for (const category of CONFIGURABLE_CATEGORIES) {
      for (const { channel, locked } of categoryChannels(category, plan)) {
        if (locked) prefs[category][channel] = true;
      }
    }

    await saveNotificationPrefs(tenantId, userId, prefs);
    revalidatePath("/dashboard/settings");
    return ok(prefs);
  } catch (e) {
    console.error("saveNotificationPrefsAction failed", e);
    return err({
      code: "DB_ERROR",
      message: "Impossible d'enregistrer vos préférences",
    });
  }
}
