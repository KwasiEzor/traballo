/**
 * Create client server action
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { withTenant } from "@/lib/db/tenant";
import { clients } from "@/db/schema";
import { z } from "zod";

const createClientSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export async function createClient(input: z.infer<typeof createClientSchema>) {
  try {
    const { tenantId } = await requireAuth();

    const validated = createClientSchema.parse(input);

    await withTenant(tenantId, async (tx) => {
      await tx.insert(clients).values({
        tenantId,
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        address: validated.address || null,
        notes: validated.notes || null,
      });
    });

    revalidatePath("/dashboard/clients");
    redirect("/dashboard/clients");
  } catch (error) {
    unstable_rethrow(error);
    console.error("Create client error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to create client",
    };
  }
}
