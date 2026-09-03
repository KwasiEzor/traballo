"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { db } from "@/lib/db";
import { artisanProfiles, sites } from "@/db/schema";
import { TRADES } from "@/lib/artisan/trades";

const schema = z.object({
  ownerName: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  tradeType: z.enum(TRADES.map((t) => t.value) as [string, ...string[]]),
  serviceArea: z.string().trim().min(2, "Indiquez votre zone d'intervention.").max(200),
  phone: z.string().trim().min(6, "Numéro de téléphone invalide.").max(30),
  whatsappNumber: z.string().trim().max(30).optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide.")
    .default("#1f5fc4"),
});

export type OnboardingState = { error?: string; fieldErrors?: Record<string, string> };

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const { tenantId, email } = await requireAuth();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "");
      if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { error: "Vérifiez les champs marqués.", fieldErrors };
  }

  const d = parsed.data;

  const tenant = await db.query.tenants.findFirst({
    where: (t, { eq: e }) => e(t.id, tenantId),
    columns: { slug: true },
  });
  const businessName =
    (
      await db.query.users.findFirst({
        where: (u, { eq: e }) => e(u.tenantId, tenantId),
        columns: { fullName: true },
      })
    )?.fullName ?? tenant?.slug ?? "Mon entreprise";

  await withTenant(tenantId, async (tx) => {
    const existingProfile = await tx.query.artisanProfiles.findFirst({
      where: eq(artisanProfiles.tenantId, tenantId),
      columns: { id: true },
    });

    const profileValues = {
      tenantId,
      businessName,
      ownerName: d.ownerName,
      email,
      phone: d.phone,
      whatsappNumber: d.whatsappNumber || null,
      address: [d.address, d.serviceArea].filter(Boolean).join(" · ") || null,
      tradeType: d.tradeType,
    };

    if (existingProfile) {
      await tx
        .update(artisanProfiles)
        .set(profileValues)
        .where(eq(artisanProfiles.id, existingProfile.id));
    } else {
      await tx.insert(artisanProfiles).values(profileValues);
    }

    const existingSite = await tx.query.sites.findFirst({
      where: eq(sites.tenantId, tenantId),
      columns: { id: true },
    });
    if (existingSite) {
      await tx
        .update(sites)
        .set({ primaryColor: d.primaryColor })
        .where(eq(sites.id, existingSite.id));
    } else {
      await tx.insert(sites).values({
        tenantId,
        primaryColor: d.primaryColor,
        metaTitle: businessName,
        metaDescription: `${businessName} — ${d.serviceArea}`,
      });
    }
  });

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard?welcome=1");
}
