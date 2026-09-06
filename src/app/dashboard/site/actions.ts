"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { sites, artisanProfiles } from "@/db/schema";
import { siteConfigSchema } from "@/lib/artisan/site-config";

const schema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide."),
  metaTitle: z.string().trim().max(160).optional().default(""),
  metaDescription: z.string().trim().max(320).optional().default(""),
  customDomain: z.string().trim().max(255).optional().default(""),
});

export type SiteState = { error?: string; ok?: boolean };

/**
 * Publish / unpublish the public site. Deliberately its own action so the
 * toggle in the dashboard takes effect on the spot, without depending on the
 * "save settings" button that also carries colour / SEO / domain.
 */
export async function setSitePublished(published: boolean): Promise<SiteState> {
  if (typeof published !== "boolean") return { error: "Requête invalide." };
  const { tenantId } = await requireAuth();

  try {
    const outcome = await withTenant(tenantId, async (tx) => {
      if (published) {
        const profile = await tx.query.artisanProfiles.findFirst({
          where: eq(artisanProfiles.tenantId, tenantId),
          columns: { id: true },
        });
        if (!profile) {
          return {
            error:
              "Complétez votre profil artisan (métier, coordonnées) avant de publier votre site.",
          } as const;
        }
      }

      const existing = await tx.query.sites.findFirst({
        where: eq(sites.tenantId, tenantId),
        columns: { id: true },
      });
      if (existing) {
        await tx
          .update(sites)
          .set({ isPublished: published, updatedAt: new Date() })
          .where(eq(sites.id, existing.id));
      } else {
        await tx.insert(sites).values({ tenantId, isPublished: published });
      }
      return { ok: true } as const;
    });

    if ("error" in outcome) return outcome;
  } catch {
    return {
      error: published
        ? "La publication a échoué. Réessayez."
        : "La mise hors ligne a échoué. Réessayez.",
    };
  }

  revalidatePath("/dashboard/site");
  return { ok: true };
}

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
        metaTitle: d.metaTitle || null,
        metaDescription: d.metaDescription || null,
        customDomain: canCustomDomain ? d.customDomain || null : null,
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

/* ----------------------- template / sections config ---------------------- */

export type ConfigState = { error?: string; ok?: boolean };

export async function saveSiteConfig(
  _prev: ConfigState,
  formData: FormData
): Promise<ConfigState> {
  const { tenantId } = await requireAuth();

  let json: unknown;
  try {
    json = JSON.parse(String(formData.get("config") ?? "{}"));
  } catch {
    return { error: "Configuration invalide." };
  }

  const parsed = siteConfigSchema.safeParse(json);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Configuration invalide." };
  }
  const cfg = parsed.data;
  // Premium template/sections are enforced at render time (resolveSiteConfig
  // downgrades) — storing the preference is fine so it re-activates on upgrade.

  try {
    await withTenant(tenantId, async (tx) => {
      const existing = await tx.query.sites.findFirst({
        where: eq(sites.tenantId, tenantId),
        columns: { id: true },
      });
      const values = {
        templateId: cfg.template ?? "standard",
        sections: cfg,
        updatedAt: new Date(),
      };
      if (existing) {
        await tx.update(sites).set(values).where(eq(sites.id, existing.id));
      } else {
        await tx.insert(sites).values({ tenantId, primaryColor: "#1f5fc4", ...values });
      }
    });
  } catch {
    return { error: "L'enregistrement a échoué." };
  }

  revalidatePath("/dashboard/site");
  return { ok: true };
}
