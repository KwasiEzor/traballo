import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  RefreshCw,
  Sparkles,
  CreditCard,
  MessagesSquare,
} from "lucide-react";
import { Section, SectionIntro } from "@/components/marketing/section";
import { PricingTiers } from "@/components/marketing/pricing-tiers";
import { FeatureMatrix } from "@/components/marketing/feature-matrix";
import { Faq } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";
import { GrainGradient } from "@/components/marketing/grain-gradient";
import { DimensionMark } from "@/components/marketing/dimension-mark";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { FAQ_GENERAL } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Free pour toujours, Pro à 24 €/mois, Business à 39 €/mois. Facturation Factur-X, site web, agent IA et rendez-vous inclus. Sans engagement.",
};

const REASSURANCE = [
  { icon: CreditCard, label: "Sans carte bancaire à l'inscription" },
  { icon: RefreshCw, label: "Changez de plan à tout moment" },
  { icon: ShieldCheck, label: "Sans engagement, résiliable en un clic" },
];

const INCLUDED = [
  {
    icon: MapPin,
    title: "Hébergé en Europe",
    text: "Vos données et celles de vos clients restent sur des serveurs de l'Union européenne. Export complet à tout moment.",
  },
  {
    icon: MessagesSquare,
    title: "Support en français",
    text: "Une équipe qui connaît le métier d'artisan et répond dans un langage clair, sans script.",
  },
  {
    icon: Sparkles,
    title: "Mises à jour incluses",
    text: "Nouvelles fonctionnalités, évolutions de conformité, améliorations : tout arrive sans surcoût.",
  },
];

const PRICING_FAQ = [
  {
    q: "Le plan Free est-il vraiment gratuit et sans limite de durée ?",
    a: "Oui. Le plan Free reste gratuit pour toujours. Il inclut un site web, 10 factures par mois et le carnet de clients. Aucune carte bancaire n'est demandée à l'inscription.",
  },
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, dans les deux sens. En cas de passage à un plan supérieur, la différence est calculée au prorata. En cas de rétrogradation, le nouveau tarif s'applique à la prochaine échéance.",
  },
  {
    q: "Comment fonctionne la facturation annuelle ?",
    a: "Vous payez 10 mois pour 12. L'abonnement est réglé en une fois pour l'année et se renouvelle à la date anniversaire. Vous pouvez repasser en mensuel à tout moment.",
  },
  {
    q: "Y a-t-il des frais cachés ?",
    a: "Non. Les seuls suppléments possibles sont les packs de SMS additionnels (5 € les 100 SMS) sur le plan Business, uniquement si vous les consommez.",
  },
  ...FAQ_GENERAL.slice(0, 3),
];

export default function TarifsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <GrainGradient className="opacity-75" />
        <div className="container-page relative py-20 text-center sm:py-24">
          <Reveal className="mx-auto flex max-w-2xl flex-col items-center">
            <DimensionMark label="Tarifs" />
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              Un tarif clair, sans surprise
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">
              Tout est inclus dès le plan Pro : facturation conforme, site,
              agent IA, rendez-vous. Pas de module payant à la carte, pas
              d&apos;engagement.
            </p>
          </Reveal>

          <RevealGroup className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {REASSURANCE.map((r) => (
              <RevealItem key={r.label} className="flex items-center gap-2">
                <r.icon className="size-4 text-primary" />
                {r.label}
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Tiers */}
      <Section className="pb-0 pt-16 sm:pt-20">
        <Reveal>
          <PricingTiers />
        </Reveal>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Prix hors taxes. TVA applicable selon votre pays. Édité en Europe,
          facturé en euros.
        </p>
      </Section>

      {/* Inclus dans tous les plans */}
      <Section>
        <SectionIntro
          eyebrow="Sans supplément"
          title="Dans tous les plans, y compris le Free"
        />
        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {INCLUDED.map((item) => (
            <RevealItem key={item.title}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="grid size-11 place-items-center rounded-lg bg-primary-subtle text-primary">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground text-pretty">
                  {item.text}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Comparatif */}
      <Section className="border-y border-border bg-muted/40">
        <SectionIntro
          align="left"
          eyebrow="Comparatif"
          title="Le détail, plan par plan"
        />
        <Reveal className="mt-10">
          <FeatureMatrix />
        </Reveal>
      </Section>

      {/* FAQ */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionIntro
            align="left"
            eyebrow="Questions sur les tarifs"
            title="Avant de vous décider"
            lede={
              <>
                Une question spécifique ?{" "}
                <Link
                  href="/contact"
                  className="font-medium text-primary hover:underline"
                >
                  Contactez-nous
                </Link>
                .
              </>
            }
          />
          <Reveal>
            <Faq items={PRICING_FAQ} />
          </Reveal>
        </div>
      </Section>

      <CtaBand
        title="Essayez gratuitement, décidez ensuite"
        subtitle="Le plan Free vous laisse tout le temps de vous faire une idée."
      />
    </>
  );
}
