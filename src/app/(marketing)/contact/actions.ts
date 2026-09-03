"use server";

import { z } from "zod";
import { sendEmail } from "@/lib/email/send";
import { ContactEmail } from "@/lib/email/templates/contact-email";

const schema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  email: z.string().trim().email("Adresse e-mail invalide."),
  company: z.string().trim().max(160).optional().default(""),
  topic: z.enum(["decouverte", "migration", "facturation", "partenariat", "autre"]),
  message: z.string().trim().min(10, "Détaillez un peu votre demande.").max(4000),
  // Honeypot — must stay empty.
  website: z.string().max(0).optional().default(""),
});

export type ContactState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const TOPIC_LABELS: Record<string, string> = {
  decouverte: "Découverte du produit",
  migration: "Migration depuis un autre outil",
  facturation: "Facturation électronique",
  partenariat: "Partenariat",
  autre: "Autre",
};

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Vérifiez les champs du formulaire.", fieldErrors };
  }

  const data = parsed.data;
  if (data.website) return { ok: true }; // silently drop bots

  const to = process.env.CONTACT_INBOX || "contact@traballo.pro";

  const result = await sendEmail({
    to,
    replyTo: data.email,
    subject: `Contact — ${TOPIC_LABELS[data.topic]} — ${data.name}`,
    react: ContactEmail({
      name: data.name,
      email: data.email,
      company: data.company,
      topic: TOPIC_LABELS[data.topic],
      message: data.message,
    }),
  });

  if ("error" in result && result.error) {
    return {
      ok: false,
      error:
        "L'envoi a échoué. Réessayez ou écrivez directement à contact@traballo.pro.",
    };
  }

  return { ok: true };
}
