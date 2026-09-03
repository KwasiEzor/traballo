"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { clients } from "@/db/schema";

const clientSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis.").max(160),
  email: z
    .string()
    .trim()
    .email("Adresse e-mail invalide.")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().max(40).optional().default(""),
  address: z.string().trim().max(400).optional().default(""),
  notes: z.string().trim().max(4000).optional().default(""),
});

export type ClientFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parse(formData: FormData) {
  return clientSchema.safeParse(Object.fromEntries(formData));
}

function toFieldErrors(err: z.ZodError): ClientFormState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "");
    if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
  }
  return { error: "Vérifiez les champs marqués.", fieldErrors };
}

export async function createClientAction(
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const { tenantId } = await requireAuth();
  const parsed = parse(formData);
  if (!parsed.success) return toFieldErrors(parsed.error);
  const d = parsed.data;

  let newId: string;
  try {
    const [row] = await withTenant(tenantId, (tx) =>
      tx
        .insert(clients)
        .values({
          tenantId,
          name: d.name,
          email: d.email || null,
          phone: d.phone || null,
          address: d.address || null,
          notes: d.notes || null,
        })
        .returning({ id: clients.id })
    );
    newId = row.id;
  } catch (error) {
    unstable_rethrow(error);
    return { error: "La création a échoué. Réessayez." };
  }

  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/clients/${newId}`);
}

export async function updateClientAction(
  id: string,
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const { tenantId } = await requireAuth();
  const parsed = parse(formData);
  if (!parsed.success) return toFieldErrors(parsed.error);
  const d = parsed.data;

  try {
    await withTenant(tenantId, (tx) =>
      tx
        .update(clients)
        .set({
          name: d.name,
          email: d.email || null,
          phone: d.phone || null,
          address: d.address || null,
          notes: d.notes || null,
          updatedAt: new Date(),
        })
        .where(and(eq(clients.id, id), eq(clients.tenantId, tenantId)))
    );
  } catch (error) {
    unstable_rethrow(error);
    return { error: "La mise à jour a échoué." };
  }

  revalidatePath(`/dashboard/clients/${id}`);
  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/clients/${id}`);
}

export async function deleteClientAction(id: string) {
  const { tenantId } = await requireAuth();
  try {
    await withTenant(tenantId, (tx) =>
      tx
        .delete(clients)
        .where(and(eq(clients.id, id), eq(clients.tenantId, tenantId)))
    );
  } catch (error) {
    unstable_rethrow(error);
    return {
      error:
        "Impossible de supprimer ce client. Il est peut-être lié à des factures.",
    };
  }
  revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients");
}
