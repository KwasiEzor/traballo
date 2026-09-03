"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants, artisanProfiles } from "@/db/schema";
import { sendEmail } from "@/lib/email/send";
import { LeadEmail } from "@/lib/email/templates/lead-email";

const schema = z.object({
  slug: z.string().min(1).max(120),
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  contact: z.string().trim().min(4, "Téléphone ou e-mail requis.").max(160),
  message: z.string().trim().min(5, "Décrivez votre besoin.").max(3000),
  website: z.string().max(0).optional().default(""),
});

export type LeadState = { ok?: boolean; error?: string };

export async function submitLead(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;
  if (d.website) return { ok: true };

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, d.slug),
    columns: { id: true },
  });
  if (!tenant) return { error: "Site introuvable." };

  const profile = await db.query.artisanProfiles.findFirst({
    where: eq(artisanProfiles.tenantId, tenant.id),
    columns: { email: true, businessName: true },
  });
  if (!profile) return { error: "Site introuvable." };

  const res = await sendEmail({
    to: profile.email,
    subject: `Nouvelle demande via votre site — ${d.name}`,
    react: LeadEmail({
      businessName: profile.businessName,
      name: d.name,
      contact: d.contact,
      message: d.message,
    }),
  });

  if ("error" in res && res.error) {
    return {
      error: "L'envoi a échoué. Réessayez ou appelez directement.",
    };
  }
  return { ok: true };
}
