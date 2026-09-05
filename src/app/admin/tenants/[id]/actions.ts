"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { tenants, artisanProfiles, users } from "@/db/schema";
import { auth } from "@/lib/auth/better-auth";
import { logAdminAction } from "@/lib/admin/audit";
import { setImpersonation, clearImpersonation } from "@/lib/admin/impersonation";

export type TenantActionState = { ok?: boolean; error?: string };

const planSchema = z.object({
  tenantId: z.string().uuid(),
  plan: z.enum(["free", "pro", "business"]),
});

export async function adminChangePlan(
  _prev: TenantActionState,
  formData: FormData
): Promise<TenantActionState> {
  const admin = await requireAdminAccess();
  const parsed = planSchema.safeParse({
    tenantId: formData.get("tenantId"),
    plan: formData.get("plan"),
  });
  if (!parsed.success) return { error: "Requête invalide." };

  const before = await db.query.tenants.findFirst({
    where: eq(tenants.id, parsed.data.tenantId),
    columns: { plan: true },
  });
  if (!before) return { error: "Artisan introuvable." };
  if (before.plan === parsed.data.plan) return { ok: true };

  await db
    .update(tenants)
    .set({ plan: parsed.data.plan, updatedAt: new Date() })
    .where(eq(tenants.id, parsed.data.tenantId));

  await logAdminAction({
    actorEmail: admin.email,
    action: "tenant.plan_changed",
    targetType: "tenant",
    targetId: parsed.data.tenantId,
    meta: { from: before.plan, to: parsed.data.plan },
  });

  revalidatePath(`/admin/tenants/${parsed.data.tenantId}`);
  return { ok: true };
}

const statusSchema = z.object({
  tenantId: z.string().uuid(),
  status: z.enum(["active", "suspended"]),
});

export async function adminSetStatus(
  _prev: TenantActionState,
  formData: FormData
): Promise<TenantActionState> {
  const admin = await requireAdminAccess();
  const parsed = statusSchema.safeParse({
    tenantId: formData.get("tenantId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Requête invalide." };

  await db
    .update(tenants)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(tenants.id, parsed.data.tenantId));

  await logAdminAction({
    actorEmail: admin.email,
    action:
      parsed.data.status === "suspended"
        ? "tenant.suspended"
        : "tenant.reactivated",
    targetType: "tenant",
    targetId: parsed.data.tenantId,
  });

  revalidatePath(`/admin/tenants/${parsed.data.tenantId}`);
  return { ok: true };
}

export async function adminResendVerification(
  _prev: TenantActionState,
  formData: FormData
): Promise<TenantActionState> {
  const admin = await requireAdminAccess();
  const tenantId = z.string().uuid().safeParse(formData.get("tenantId"));
  if (!tenantId.success) return { error: "Requête invalide." };

  const owner = await db.query.users.findFirst({
    where: eq(users.tenantId, tenantId.data),
    columns: { email: true },
  });
  if (!owner) return { error: "Aucun utilisateur." };

  try {
    await auth.api.sendVerificationEmail({ body: { email: owner.email } });
  } catch {
    return { error: "L'envoi a échoué." };
  }

  await logAdminAction({
    actorEmail: admin.email,
    action: "tenant.verification_resent",
    targetType: "tenant",
    targetId: tenantId.data,
    meta: { email: owner.email },
  });
  return { ok: true };
}

export async function adminStartImpersonation(formData: FormData): Promise<void> {
  const admin = await requireAdminAccess();
  const tenantId = z.string().uuid().safeParse(formData.get("tenantId"));
  if (!tenantId.success) redirect("/admin/tenants");

  const t = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId.data),
    columns: { id: true, slug: true },
  });
  if (!t) redirect("/admin/tenants");

  await setImpersonation(t.id, admin.email);
  await logAdminAction({
    actorEmail: admin.email,
    action: "tenant.impersonation_started",
    targetType: "tenant",
    targetId: t.id,
    meta: { slug: t.slug },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  redirect(appUrl ? `${appUrl}/dashboard` : "/dashboard");
}

export async function adminStopImpersonation(): Promise<void> {
  await requireAdminAccess();
  await clearImpersonation();
  redirect("/admin/tenants");
}

/** Save the profile owner name / phone from the admin panel (support fixes). */
const profileSchema = z.object({
  tenantId: z.string().uuid(),
  ownerName: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional().default(""),
});

export async function adminUpdateProfile(
  _prev: TenantActionState,
  formData: FormData
): Promise<TenantActionState> {
  const admin = await requireAdminAccess();
  const parsed = profileSchema.safeParse({
    tenantId: formData.get("tenantId"),
    ownerName: formData.get("ownerName"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: "Requête invalide." };

  await db
    .update(artisanProfiles)
    .set({
      ownerName: parsed.data.ownerName,
      phone: parsed.data.phone || null,
      updatedAt: new Date(),
    })
    .where(eq(artisanProfiles.tenantId, parsed.data.tenantId));

  await logAdminAction({
    actorEmail: admin.email,
    action: "tenant.profile_edited",
    targetType: "tenant",
    targetId: parsed.data.tenantId,
  });

  revalidatePath(`/admin/tenants/${parsed.data.tenantId}`);
  return { ok: true };
}
