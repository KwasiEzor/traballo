import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Clock,
  LifeBuoy,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { Section } from "@/components/marketing/section";
import { GrainGradient } from "@/components/marketing/grain-gradient";
import { DimensionMark } from "@/components/marketing/dimension-mark";
import { Reveal } from "@/components/motion/reveal";
import { turnstileSiteKey } from "@/lib/security/turnstile";
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
    text: "Questions commerciales ou générales.",
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
  const siteKey = turnstileSiteKey();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <GrainGradient className="opacity-70" />
        <div className="container-page relative pt-16 pb-12 sm:pt-20 sm:pb-16">
          <Reveal className="max-w-2xl">
            <DimensionMark label="Contact" />
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              Parlons de votre activité
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">
              Que vous hésitiez encore, que vous migriez depuis un autre outil ou
              que vous ayez une question précise sur la conformité, on vous répond
              en français — sans script commercial.
            </p>
          </Reveal>
        </div>
      </section>

      <Section className="pt-12 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Left rail */}
          <Reveal className="space-y-4">
            {CHANNELS.map((c) => (
              <a
                key={c.title}
                href={`mailto:${c.value}`}
                className="group flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-subtle text-primary">
                  <c.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                    {c.title}
                    <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[13px] text-primary">
                    {c.value}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground text-pretty">
                    {c.text}
                  </p>
                </div>
              </a>
            ))}

            <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Réponse sous un jour ouvré, du lundi au vendredi.
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Données et support basés dans l&apos;Union européenne.
              </div>
            </div>

            <p className="px-1 text-sm text-muted-foreground">
              Vous cherchez une réponse rapide ? La{" "}
              <Link
                href="/fonctionnalites#faq"
                className="font-medium text-primary hover:underline"
              >
                foire aux questions
              </Link>{" "}
              couvre la conformité, l&apos;hébergement et la migration.
            </p>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-blueprint opacity-[0.3] [mask-image:radial-gradient(ellipse_70%_50%_at_100%_0%,black,transparent)]"
              />
              <div className="relative">
                <ContactForm turnstileSiteKey={siteKey} />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
