"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenants, artisanProfiles } from "@/db/schema";
import { sendEmail } from "@/lib/email/send";
import { UpgradeRequestEmail } from "@/lib/email/templates/upgrade-request-email";
import { parseAdminEmails } from "@/lib/auth/admin";

export type UpgradeState = { ok?: boolean; error?: string };

const schema = z.object({ plan: z.enum(["pro", "business"]) });

export async function requestUpgrade(
  _prev: UpgradeState,
  formData: FormData
): Promise<UpgradeState> {
  const { tenantId, plan: currentPlan, email } = await requireAuth();
  const parsed = schema.safeParse({ plan: formData.get("plan") });
  if (!parsed.success) return { error: "Plan invalide." };
  const target = parsed.data.plan;

  const [tenant, profile] = await Promise.all([
    db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
      columns: { slug: true },
    }),
    db.query.artisanProfiles.findFirst({
      where: eq(artisanProfiles.tenantId, tenantId),
      columns: { businessName: true, ownerName: true, phone: true },
    }),
  ]);

  const to =
    parseAdminEmails(process.env.ADMIN_EMAILS)[0] ||
    process.env.CONTACT_INBOX ||
    "contact@traballo.pro";

  const res = await sendEmail({
    to,
    replyTo: email,
    subject: `Demande de passage au plan ${target === "pro" ? "Pro" : "Business"} — ${profile?.businessName ?? tenant?.slug ?? tenantId}`,
    react: UpgradeRequestEmail({
      businessName: profile?.businessName ?? "—",
      ownerName: profile?.ownerName ?? "—",
      email,
      phone: profile?.phone ?? "—",
      slug: tenant?.slug ?? "—",
      currentPlan,
      targetPlan: target,
    }),
  });

  if ("error" in res && res.error) {
    return { error: "L'envoi a échoué. Écrivez à aide@traballo.pro." };
  }
  return { ok: true };
}
