import Link from "next/link";
import {
  Globe,
  FileCheck2,
  Sparkles,
  CalendarDays,
  Clock,
  TrendingDown,
  Search,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Section, SectionIntro } from "@/components/marketing/section";
import { Hero } from "@/components/marketing/hero";
import { TradesMarquee } from "@/components/marketing/trades-marquee";
import { DimensionMark } from "@/components/marketing/dimension-mark";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import { PricingTiers } from "@/components/marketing/pricing-tiers";
import { CtaBand } from "@/components/marketing/cta-band";
import { InvoiceMock, SiteMock, ChatMock } from "@/components/marketing/mockups";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { TiltCard } from "@/components/motion/tilt-card";
import { PILLARS, FAQ_GENERAL } from "@/lib/marketing/content";

const PILLAR_ICONS = { Globe, FileCheck2, Sparkles, CalendarDays } as const;

const PROBLEMS = [
  { icon: Clock, value: 5, prefix: "3 à ", suffix: " h", label: "perdues chaque semaine sur l'administratif" },
  { icon: Search, value: 89, suffix: " %", label: "des artisans n'ont pas d'outils numériques adaptés" },
  { icon: TrendingDown, value: 30, prefix: "20–", suffix: " %", label: "de rendez-vous manqués sans rappel automatique" },
];

const STEPS = [
  {
    n: "01",
    title: "Vous répondez à 5 questions",
    text: "Métier, zone d'intervention, coordonnées, couleur, logo. Trois minutes, pas plus.",
  },
  {
    n: "02",
    title: "Votre site et vos outils sont prêts",
    text: "Site en ligne, modèle de facture configuré, agent IA briefé sur votre activité.",
  },
  {
    n: "03",
    title: "Vous gérez tout depuis un tableau de bord",
    text: "Factures, clients, rendez-vous, messages. Sur ordinateur comme sur mobile.",
  },
];

const showcase = [
  {
    id: "facturation",
    eyebrow: "Facturation",
    title: "Des factures aux normes, sans y penser",
    description:
      "Créez un devis, transformez-le en facture, envoyez-le. Traballo s'occupe du format Factur-X, de la numérotation légale continue et des relances.",
    points: [
      "Format Factur-X (PDF + XML) et transmission PEPPOL",
      "Numérotation séquentielle conforme, TVA FR / BE / LU",
      "Relances de paiement automatiques et suivi des impayés",
      "Export comptable pour votre expert-comptable",
    ],
    frameUrl: "app.traballo.pro/factures",
    visual: <InvoiceMock />,
  },
  {
    id: "site",
    eyebrow: "Site web",
    title: "Une vitrine qui inspire confiance en 30 minutes",
    description:
      "Un site pensé pour convertir : ce que vous faites, où vous intervenez, comment vous joindre — visible en trois secondes.",
    points: [
      "Templates par métier (plomberie, électricité, nettoyage…)",
      "Bouton d'appel et de devis toujours visibles, optimisé mobile",
      "Référencement local et pages de service dédiées",
      "Votre domaine, votre logo, vos couleurs",
    ],
    frameUrl: "elec-martin.fr",
    visual: <SiteMock />,
  },
  {
    id: "agent-ia",
    eyebrow: "Agent IA",
    title: "Un assistant qui ne dort jamais",
    description:
      "Vos visiteurs posent leurs questions à toute heure. L'agent répond dans votre ton, qualifie la demande et propose un créneau.",
    points: [
      "Cadré sur vos services, tarifs, zone et horaires",
      "Ne s'engage jamais sur un prix ferme sans votre validation",
      "Capture les coordonnées et vous notifie immédiatement",
      "Disponible sur le site et sur WhatsApp (plan Business)",
    ],
    frameUrl: "elec-martin.fr",
    visual: <ChatMock />,
  },
];

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TradesMarquee />

      {/* Problème */}
      <Section className="border-b border-border bg-muted/40">
        <SectionIntro
          eyebrow="Le constat"
          title="Vous êtes un excellent artisan. Le numérique vous fait perdre du temps et des clients."
          lede="Papier, Excel, WhatsApp personnel, un vieux site qui ne fonctionne plus. Pendant ce temps, un concurrent moins qualifié mais mieux présenté récupère le chantier."
        />
        <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-3">
          {PROBLEMS.map((p) => (
            <RevealItem
              key={p.label}
              className="hover-lift rounded-xl border border-border bg-card p-6 text-center shadow-sm"
            >
              <p.icon className="mx-auto size-6 text-primary" />
              <div className="mt-3 font-display text-3xl font-semibold text-foreground">
                {p.prefix}
                <CountUp value={p.value} />
                {p.suffix}
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground text-balance">
                {p.label}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Piliers */}
      <Section>
        <SectionIntro
          eyebrow="La solution"
          title="Le business pack tout-en-un"
          lede="Quatre outils qui marchent ensemble, à la place de cinq abonnements qui ne se parlent pas."
        />
        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.icon];
            return (
              <RevealItem key={pillar.id}>
                <TiltCard className="h-full">
                  <Card className="h-full p-6 transition-shadow hover:shadow-md">
                    <div className="grid size-11 place-items-center rounded-lg bg-primary-subtle text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {pillar.description}
                    </p>
                  </Card>
                </TiltCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Section>

      {/* Deep dives */}
      <Section className="border-y border-border bg-muted/40">
        <FeatureShowcase items={showcase} />
        <Reveal className="mt-16 text-center" delay={0.1}>
          <Button asChild variant="outline" size="lg">
            <Link href="/fonctionnalites">
              Voir toutes les fonctionnalités
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>
      </Section>

      {/* Étapes */}
      <Section>
        <SectionIntro
          eyebrow="Prise en main"
          title="En ligne le jour même"
          lede="Pas de formation, pas de migration, pas de consultant."
        />
        <RevealGroup as="ol" className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          <div
            aria-hidden="true"
            className="absolute top-5 left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />
          {STEPS.map((s) => (
            <RevealItem key={s.n} as="li" className="relative">
              <div className="relative z-10 grid size-10 place-items-center rounded-full border-2 border-primary bg-background font-display text-sm font-semibold text-primary">
                {s.n}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.text}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Conformité — ancre institutionnelle */}
      <Section className="relative overflow-hidden border-y border-border bg-primary-subtle">
        <div className="pointer-events-none absolute inset-0 bg-blueprint opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <DimensionMark label="Conformité" className="mb-3" />
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="size-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                2026 / 2027
              </span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Prêt pour la facturation électronique obligatoire
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
              La Belgique impose la facture électronique B2B depuis 2026. La France
              suit : réception en 2026, émission en 2027 pour les TPE et PME.
              Traballo est conçu pour être conforme dès votre inscription.
            </p>
          </Reveal>
          <RevealGroup as="ul" className="space-y-3">
            {[
              "Format Factur-X (facture hybride PDF + données)",
              "Transmission via le réseau PEPPOL",
              "Mentions légales et TVA FR · BE · LU",
              "Archivage et export à valeur probante",
              "Données hébergées exclusivement en Europe",
            ].map((item) => (
              <RevealItem
                as="li"
                key={item}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-xs"
              >
                <FileCheck2 className="size-4 shrink-0 text-success" />
                {item}
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      {/* Témoignages */}
      <Section>
        <SectionIntro
          eyebrow="Ils l'utilisent"
          title="Des artisans comme vous"
        />
        <div className="mt-14">
          <Testimonials />
        </div>
      </Section>

      {/* Tarifs */}
      <Section id="tarifs" className="border-y border-border bg-muted/40">
        <SectionIntro
          eyebrow="Tarifs"
          title="Un prix simple, moins que votre café quotidien"
          lede="Commencez gratuitement, pour toujours. Passez à Pro quand vous êtes prêt."
        />
        <div className="mt-14">
          <PricingTiers />
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Besoin d&apos;un comparatif détaillé ?{" "}
          <Link href="/tarifs" className="font-medium text-primary hover:underline">
            Voir tous les tarifs
          </Link>
        </p>
      </Section>

      {/* FAQ */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionIntro
            align="left"
            eyebrow="Questions fréquentes"
            title="Ce qu'on nous demande le plus"
            lede={
              <>
                Une autre question ?{" "}
                <Link href="/contact" className="font-medium text-primary hover:underline">
                  Écrivez-nous
                </Link>
                .
              </>
            }
          />
          <Faq items={FAQ_GENERAL} />
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
