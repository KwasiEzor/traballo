import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email/send";
import { MarketingLeadEmail } from "@/lib/email/templates/marketing-lead-email";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide."),
  name: z.string().trim().max(120).optional().default(""),
  note: z.string().trim().max(2000).optional().default(""),
  transcript: z.string().trim().max(6000).optional().default(""),
  // Honeypot.
  website: z.string().max(0).optional().default(""),
});

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." },
      { status: 400 }
    );
  }
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true });

  const to = process.env.CONTACT_INBOX || "contact@traballo.pro";
  const res = await sendEmail({
    to,
    replyTo: d.email,
    subject: `Contact assistant site — ${d.name || d.email}`,
    react: MarketingLeadEmail({
      email: d.email,
      name: d.name || undefined,
      note: d.note || undefined,
      transcript: d.transcript || undefined,
    }),
  });

  if ("error" in res && res.error) {
    return NextResponse.json(
      { error: "L'envoi a échoué. Réessayez ou utilisez la page Contact." },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true });
}
