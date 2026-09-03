"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { aiAgentConfig } from "@/db/schema";

const schema = z.object({
  agentName: z.string().trim().min(1, "Donnez un nom à l'assistant.").max(60),
  isEnabled: z.enum(["on", "off"]).optional(),
  tone: z.enum(["professional", "warm", "direct"]),
  businessContext: z.string().trim().max(6000).optional().default(""),
  openingMessage: z.string().trim().max(500).optional().default(""),
  offHoursMessage: z.string().trim().max(500).optional().default(""),
});

export type AgentState = { error?: string; ok?: boolean };

export async function saveAgentConfig(
  _prev: AgentState,
  formData: FormData
): Promise<AgentState> {
  const { tenantId } = await requireAuth();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;

  try {
    await withTenant(tenantId, async (tx) => {
      const existing = await tx.query.aiAgentConfig.findFirst({
        where: eq(aiAgentConfig.tenantId, tenantId),
        columns: { id: true },
      });
      const values = {
        agentName: d.agentName,
        isEnabled: d.isEnabled === "on",
        tone: d.tone,
        businessContext: d.businessContext || null,
        openingMessage: d.openingMessage || null,
        offHoursMessage: d.offHoursMessage || null,
        updatedAt: new Date(),
      };
      if (existing) {
        await tx
          .update(aiAgentConfig)
          .set(values)
          .where(eq(aiAgentConfig.id, existing.id));
      } else {
        await tx.insert(aiAgentConfig).values({ tenantId, languages: ["fr"], ...values });
      }
    });
  } catch {
    return { error: "L'enregistrement a échoué." };
  }

  revalidatePath("/dashboard/agent");
  return { ok: true };
}
