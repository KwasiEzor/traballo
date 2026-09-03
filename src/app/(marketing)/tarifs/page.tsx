import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionIntro } from "@/components/marketing/section";
import { PricingTiers } from "@/components/marketing/pricing-tiers";
import { FeatureMatrix } from "@/components/marketing/feature-matrix";
import { Faq } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";
import { FAQ_GENERAL } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Free pour toujours, Pro à 29 €/mois, Business à 49 €/mois. Facturation Factur-X, site web, agent IA et rendez-vous inclus. Sans engagement.",
};

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
      <Section className="pb-0">
        <SectionIntro
          eyebrow="Tarifs"
          title="Un tarif clair, sans surprise"
          lede="Tout est inclus dès le plan Pro : facturation conforme, site, agent IA, rendez-vous. Pas de module payant à la carte, pas d'engagement."
        />
        <div className="mt-14">
          <PricingTiers />
        </div>
      </Section>

      <Section>
        <SectionIntro
          align="left"
          eyebrow="Comparatif"
          title="Le détail, plan par plan"
        />
        <div className="mt-10">
          <FeatureMatrix />
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Les prix sont indiqués hors taxes. TVA applicable selon votre pays.
          Traballo est édité en Europe et facture en euros.
        </p>
      </Section>

      <Section className="border-t border-border bg-muted/40">
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
          <Faq items={PRICING_FAQ} />
        </div>
      </Section>

      <CtaBand
        title="Essayez gratuitement, décidez ensuite"
        subtitle="Le plan Free vous laisse tout le temps de vous faire une idée."
      />
    </>
  );
}
