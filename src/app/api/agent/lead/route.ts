import { and, eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { tenants, artisanProfiles, aiConversations, aiMessages } from "@/db/schema";
import { sendEmail } from "@/lib/email/send";
import { LeadEmail } from "@/lib/email/templates/lead-email";
import { createNotification } from "@/lib/notifications/create";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  slug: z.string().trim().min(1).max(120),
  conversationId: z.string().uuid(),
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  contact: z.string().trim().min(4, "Téléphone ou e-mail requis.").max(160),
  need: z.string().trim().max(2000).optional().default(""),
});

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." },
      { status: 400 }
    );
  }
  const { slug, conversationId, name, contact, need } = parsed.data;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
    columns: { id: true },
  });
  if (!tenant) {
    return NextResponse.json({ error: "Site introuvable." }, { status: 404 });
  }

  const conversation = await db.query.aiConversations.findFirst({
    where: and(
      eq(aiConversations.id, conversationId),
      eq(aiConversations.tenantId, tenant.id)
    ),
    columns: { id: true, leadEmail: true },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });
  }

  const profile = await db.query.artisanProfiles.findFirst({
    where: eq(artisanProfiles.tenantId, tenant.id),
    columns: { email: true, businessName: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Site introuvable." }, { status: 404 });
  }

  const looksLikeEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact);

  await db
    .update(aiConversations)
    .set({
      leadName: name,
      leadEmail: looksLikeEmail ? contact : conversation.leadEmail,
      leadPhone: looksLikeEmail ? null : contact,
      updatedAt: new Date(),
    })
    .where(eq(aiConversations.id, conversationId));

  // Build a short transcript for the notification.
  const history = await db.query.aiMessages.findMany({
    where: eq(aiMessages.conversationId, conversationId),
    orderBy: [desc(aiMessages.createdAt)],
    limit: 8,
    columns: { role: true, content: true },
  });
  const transcript = history
    .reverse()
    .map((m) => `${m.role === "user" ? "Visiteur" : "Assistant"} : ${m.content}`)
    .join("\n");

  const message = [
    need && `Besoin exprimé : ${need}`,
    transcript && `--- Extrait de la conversation ---\n${transcript}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const res = await sendEmail({
    to: profile.email,
    subject: `Nouveau contact via l'assistant — ${name}`,
    react: LeadEmail({
      businessName: profile.businessName,
      name,
      contact,
      message: message || "Coordonnées laissées via l'assistant du site.",
    }),
  });

  if ("error" in res && res.error) {
    return NextResponse.json(
      { error: "L'envoi a échoué. Réessayez ou appelez directement." },
      { status: 502 }
    );
  }

  await createNotification({
    tenantId: tenant.id,
    type: "leads.ai_lead",
    title: `Nouveau contact via l'assistant — ${name}`,
    body: need || "Coordonnées laissées via l'assistant du site.",
    data: { name, contact, conversationId },
  });

  return NextResponse.json({ ok: true });
}
