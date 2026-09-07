"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants, artisanProfiles } from "@/db/schema";
import { sendEmail } from "@/lib/email/send";
import { LeadEmail } from "@/lib/email/templates/lead-email";
import { createNotification } from "@/lib/notifications/create";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";
import { tenantLeadCapReached } from "@/lib/security/lead-cap";

const schema = z.object({
  slug: z.string().min(1).max(120),
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  contact: z.string().trim().min(4, "Téléphone ou e-mail requis.").max(160),
  message: z.string().trim().min(5, "Décrivez votre besoin.").max(3000),
  // Honeypot — kept loose in the schema so a filled value reaches the silent
  // drop below instead of surfacing a validation error the bot can learn from.
  website: z.string().max(200).optional().default(""),
  "cf-turnstile-response": z.string().optional().default(""),
});

export type LeadState = { ok?: boolean; error?: string };

// A quiet success — the submission was dropped (bot, cap) but we give the
// client no signal it can probe against.
const SILENT_OK: LeadState = { ok: true };

export async function submitLead(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;

  // 1. Honeypot — always-on baseline.
  if (d.website) return SILENT_OK;

  const h = await headers();
  const ip = clientIp(h);

  // 2. Rate limit: per IP + per site. Best-effort per-instance; the Vercel
  //    Firewall rule is the authoritative edge layer.
  if (!rateLimit(`site-lead:${ip}:${d.slug}`, 5, 10 * 60_000).ok) {
    return { error: "Trop de demandes. Réessayez dans quelques minutes." };
  }

  // 3. Turnstile. Custom artisan domains can't be enumerated, so skip the
  //    hostname allow-list. A missing or rejected token blocks; an unreachable
  //    Cloudflare or a disabled widget falls through (availability > strictness).
  const captcha = await verifyTurnstile(d["cf-turnstile-response"], {
    remoteIp: ip === "unknown" ? undefined : ip,
    expectedAction: "site-lead",
    allowAnyHostname: true,
  });
  if (captcha.reason === "missing" || captcha.reason === "rejected") {
    return {
      error:
        "La vérification anti-spam a échoué. Rechargez la page et réessayez.",
    };
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, d.slug),
    columns: { id: true },
  });
  if (!tenant) return { error: "Site introuvable." };

  // 4. Hard per-tenant daily cap — the guarantee. Past this, drop silently.
  if (await tenantLeadCapReached(tenant.id)) {
    console.warn(`[submitLead] daily lead cap reached for tenant ${tenant.id}`);
    return SILENT_OK;
  }

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

  await createNotification({
    tenantId: tenant.id,
    type: "leads.site_enquiry",
    title: `Nouvelle demande — ${d.name}`,
    body: d.message.slice(0, 240),
    data: { name: d.name, contact: d.contact },
  });

  return { ok: true };
}
