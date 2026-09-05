"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/auth/admin";
import {
  setAnthropicApiKey,
  clearAnthropicApiKey,
} from "@/lib/ai/settings";
import { logAdminAction } from "@/lib/admin/audit";

export type SettingsState = { ok?: boolean; error?: string };

const keySchema = z
  .string()
  .trim()
  .min(20, "Clé trop courte.")
  .max(300)
  .regex(/^sk-ant-/, "Une clé Anthropic commence par « sk-ant- ».");

export async function saveAnthropicKey(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const admin = await requireAdminAccess();

  const intent = String(formData.get("intent") ?? "save");
  if (intent === "clear") {
    try {
      await clearAnthropicApiKey();
    } catch {
      return { error: "La suppression a échoué." };
    }
    await logAdminAction({
      actorEmail: admin.email,
      action: "settings.anthropic_key_set",
      meta: { cleared: true },
    });
    revalidatePath("/admin/settings");
    return { ok: true };
  }

  const parsed = keySchema.safeParse(formData.get("key"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Clé invalide." };
  }

  try {
    await setAnthropicApiKey(parsed.data);
  } catch {
    return { error: "L'enregistrement a échoué." };
  }

  await logAdminAction({
    actorEmail: admin.email,
    action: "settings.anthropic_key_set",
    meta: { suffix: parsed.data.slice(-4) },
  });
  revalidatePath("/admin/settings");
  return { ok: true };
}
