"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { sites } from "@/db/schema";

const schema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide."),
  templateId: z.string().min(1).max(40),
  metaTitle: z.string().trim().max(160).optional().default(""),
  metaDescription: z.string().trim().max(320).optional().default(""),
  customDomain: z.string().trim().max(255).optional().default(""),
  isPublished: z.enum(["on", "off"]).optional(),
});

export type SiteState = { error?: string; ok?: boolean };

export async function saveSite(
  _prev: SiteState,
  formData: FormData
): Promise<SiteState> {
  const { tenantId, plan } = await requireAuth();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;
  const canCustomDomain = plan === "pro" || plan === "business";

  try {
    await withTenant(tenantId, async (tx) => {
      const existing = await tx.query.sites.findFirst({
        where: eq(sites.tenantId, tenantId),
        columns: { id: true },
      });
      const values = {
        primaryColor: d.primaryColor,
        templateId: d.templateId,
        metaTitle: d.metaTitle || null,
        metaDescription: d.metaDescription || null,
        customDomain: canCustomDomain ? d.customDomain || null : null,
        isPublished: d.isPublished === "on",
        updatedAt: new Date(),
      };
      if (existing) {
        await tx.update(sites).set(values).where(eq(sites.id, existing.id));
      } else {
        await tx.insert(sites).values({ tenantId, ...values });
      }
    });
  } catch {
    return { error: "L'enregistrement a échoué." };
  }

  revalidatePath("/dashboard/site");
  return { ok: true };
}
