import type { Metadata } from "next";
import { Mail, MessageSquare, Clock, LifeBuoy } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Une question sur Traballo, la facturation électronique ou une migration ? Écrivez-nous, on répond sous un jour ouvré.",
};

const CHANNELS = [
  {
    icon: Mail,
    title: "E-mail",
    value: "contact@traballo.pro",
    text: "Pour toute question commerciale ou générale.",
  },
  {
    icon: LifeBuoy,
    title: "Support client",
    value: "aide@traballo.pro",
    text: "Réservé aux utilisateurs. Réponse < 48 h (Pro) ou < 24 h (Business).",
  },
  {
    icon: MessageSquare,
    title: "Données personnelles",
    value: "privacy@traballo.pro",
    text: "Exercice de vos droits RGPD.",
  },
];

export default function ContactPage() {
  return (
    <Section className="pt-12">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Contact
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Parlons de votre activité
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Que vous hésitiez encore, que vous migriez depuis un autre outil ou
            que vous ayez une question précise sur la conformité, on vous répond
            en français, sans script commercial.
          </p>

          <div className="mt-10 space-y-5">
            {CHANNELS.map((c) => (
              <div key={c.title} className="flex gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-subtle text-primary">
                  <c.icon className="size-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {c.title}
                  </div>
                  <a
                    href={`mailto:${c.value}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {c.value}
                  </a>
                  <p className="mt-0.5 text-sm text-muted-foreground">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <Clock className="size-4 text-primary" />
            Réponse sous un jour ouvré, du lundi au vendredi.
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
